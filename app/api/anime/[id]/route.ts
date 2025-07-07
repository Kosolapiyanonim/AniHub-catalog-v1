// Замените содержимое файла: /app/api/anime/[id]/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id: shikimoriId } = params; // ID теперь является shikimori_id

    // Проверяем, что ID является числом
    if (!shikimoriId || !/^\d+$/.test(shikimoriId)) {
      return NextResponse.json({ error: "Invalid anime ID format" }, { status: 400 });
    }

    console.log("🎬 Fetching anime data for shikimori_id:", shikimoriId);

    // Шаг 1: Найти основную информацию об аниме по shikimori_id
    const { data: animeData, error: animeError } = await supabase
      .from("animes_with_relations")
      .select("*")
      .eq("shikimori_id", shikimoriId)
      .single();

    if (animeError) {
      if (animeError.code === 'PGRST116') {
         return NextResponse.json({ error: "Anime not found" }, { status: 404 });
      }
      throw animeError;
    }

    // Шаг 2: Найти все связанные озвучки по главному ID аниме
    const { data: translationsData, error: translationsError } = await supabase
      .from("translations")
      .select("*")
      .eq("anime_id", animeData.id)
      .order("title");

    if (translationsError) {
      throw translationsError;
    }

    // Шаг 3: Объединяем все в один ответ
    const responseData = {
      ...animeData,
      translations: translationsData || [],
    };

    return NextResponse.json(responseData);

  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Error in anime API [id]:", message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
