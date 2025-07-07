// Замените содержимое файла: /app/api/anime/[id]/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // ID теперь является shikimori_id, так как он уникален для аниме в целом
    if (!id || id === "undefined" || !/^\d+$/.test(id)) {
      return NextResponse.json({ error: "Invalid anime ID format" }, { status: 400 });
    }

    console.log("🎬 Fetching anime data for shikimori_id:", id);

    // Шаг 1: Находим основную информацию об аниме
    const { data: animeData, error: animeError } = await supabase
      .from("animes_with_relations")
      .select("*")
      .eq("shikimori_id", id)
      .single();

    if (animeError) {
      if (animeError.code === 'PGRST116') {
         return NextResponse.json({ error: "Anime not found" }, { status: 404 });
      }
      throw animeError;
    }

    // Шаг 2: Находим все связанные озвучки
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
