// /app/api/anime/[id]/route.ts

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Проверяем, что ID является корректным числовым значением
    if (!id || !/^\d+$/.test(id)) {
      return NextResponse.json({ error: "Invalid anime ID format" }, { status: 400 });
    }

    console.log(`🎬 Fetching all data for shikimori_id: ${id}`);

    // ====================================================================
    // ОПТИМИЗИРОВАННЫЙ ЗАПРОС
    // Мы делаем один запрос, который получает всю необходимую информацию:
    // 1. Все поля из таблицы `animes` (*).
    // 2. Все связанные записи из таблицы `translations` (*).
    // 3. Имена связанных жанров, студий и стран через промежуточные таблицы.
    // ====================================================================
    const { data, error } = await supabase
      .from("animes")
      .select(`
        *, 
        translations(*),
        genres:anime_genres(genres(name)),
        studios:anime_studios(studios(name)),
        countries:anime_countries(countries(name))
      `)
      .eq("shikimori_id", id)
      .single(); // .single() для получения одного объекта, а не массива

    // Обработка ошибок от Supabase
    if (error) {
      // Если аниме не найдено, Supabase вернет ошибку с кодом PGRST116
      if (error.code === 'PGRST116') {
        console.warn(`🕵️ Anime with shikimori_id ${id} not found.`);
        return NextResponse.json({ error: "Anime not found" }, { status: 404 });
      }
      // Для всех других ошибок, выбрасываем их для дальнейшей обработки
      throw error;
    }

    // ====================================================================
    // ПРЕОБРАЗОВАНИЕ ДАННЫХ
    // Supabase возвращает связанные данные в виде вложенных объектов.
    // Мы преобразуем их в простые массивы строк для удобства на фронтенде.
    // Например, из [{ genres: { name: 'Экшен' } }] делаем ['Экшен'].
    // ====================================================================
    const responseData = {
      ...data,
      genres: data.genres.map((g: any) => g.genres.name).filter(Boolean),
      studios: data.studios.map((s: any) => s.studios.name).filter(Boolean),
      countries: data.countries.map((c: any) => c.countries.name).filter(Boolean),
      // Убеждаемся, что translations всегда является массивом
      translations: data.translations || [],
    };

    return NextResponse.json(responseData);

  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ Error in /api/anime/[id]:", message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
