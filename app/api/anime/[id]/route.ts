// /app/api/anime/[id]/route.ts

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    if (!id || !/^\d+$/.test(id)) {
      return NextResponse.json({ error: "Неверный формат ID аниме" }, { status: 400 });
    }

    // Шаг 1: Находим основную информацию об аниме по shikimori_id
    const { data: anime, error: animeError } = await supabase
      .from("animes")
      .select("*") // Запрашиваем все поля из основной таблицы
      .eq("shikimori_id", id)
      .single();

    if (animeError) {
      if (animeError.code === 'PGRST116') { // Код ошибки "не найдено"
        return NextResponse.json({ error: "Аниме не найдено" }, { status: 404 });
      }
      throw animeError; 
    }

    // Шаг 2: Используя внутренний ID аниме (anime.id), находим все связанные озвучки
    const { data: translations, error: translationsError } = await supabase
      .from("translations")
      .select("*")
      .eq("anime_id", anime.id); // Связь по внутреннему ID

    if (translationsError) {
      throw translationsError;
    }

    // Шаг 3: Объединяем все в один ответ для страницы
    const responseData = {
      ...anime,
      translations: translations || [], // Это поле теперь будет заполнено
      // Добавляем пустые массивы для совместимости с другими компонентами
      genres: [], 
      studios: [],
      countries: [],
    };

    return NextResponse.json(responseData);

  } catch (err) {
    const message = err instanceof Error ? err.message : JSON.stringify(err);
    console.error("❌ Ошибка в /api/anime/[id]:", message);
    return NextResponse.json({ error: "Внутренняя ошибка сервера", details: message }, { status: 500 });
  }
}
