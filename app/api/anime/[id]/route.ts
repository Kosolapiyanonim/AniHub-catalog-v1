// Замените содержимое файла: /app/api/anime/[id]/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id: kodikId } = params; // ID теперь является kodik_id

    if (!kodikId || kodikId === "undefined") {
      return NextResponse.json({ error: "Invalid anime ID provided" }, { status: 400 });
    }

    console.log("🎬 Fetching anime data for kodik_id:", kodikId);

    // Шаг 1: Найти одну озвучку по kodik_id, чтобы узнать главный anime_id
    const { data: translation, error: translationError } = await supabase
      .from('translations')
      .select('anime_id')
      .eq('kodik_id', kodikId)
      .single();
    
    if (translationError) {
        if (translationError.code === 'PGRST116') {
           return NextResponse.json({ error: "Translation not found for the given Kodik ID" }, { status: 404 });
        }
        throw translationError;
    }

    const animeId = translation.anime_id;

    // Шаг 2: Найти основную информацию об аниме по его главному ID
    const { data: animeData, error: animeError } = await supabase
      .from("animes_with_relations")
      .select("*")
      .eq("id", animeId)
      .single();

    if (animeError) {
      if (animeError.code === 'PGRST116') {
         return NextResponse.json({ error: "Anime data not found" }, { status: 404 });
      }
      throw animeError;
    }

    // Шаг 3: Найти все связанные озвучки по главному ID
    const { data: translationsData, error: translationsError } = await supabase
      .from("translations")
      .select("*")
      .eq("anime_id", animeId)
      .order("title");

    if (translationsError) {
      throw translationsError;
    }

    // Шаг 4: Объединяем все в один ответ
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
