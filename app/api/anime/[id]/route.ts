import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const shikimoriId = params.id;
  if (!shikimoriId) {
    return NextResponse.json({ error: "Shikimori ID is required" }, { status: 400 });
  }

  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    // --- ШАГ 1: Получаем основную информацию об аниме и его прямые связи (жанры, студии) ---
    const { data: anime, error: animeError } = await supabase
      .from('animes')
      .select(`
        *, 
        genres:anime_genres(genres(id, name, slug)), 
        studios:anime_studios(studios(id, name, slug)),
        tags:anime_tags(tags(id, name, slug))
      `)
      .eq('shikimori_id', shikimoriId)
      .single();

    if (animeError) {
      if (animeError.code === 'PGRST116') { // Код ошибки "не найдено"
        return NextResponse.json({ error: 'Аниме не найдено' }, { status: 404 });
      }
      throw animeError;
    }

    // --- ШАГ 2: Получаем озвучки и ID связанных произведений параллельно ---
    const [translationsResponse, relatedResponse] = await Promise.all([
      supabase.from('translations').select('*').eq('anime_id', anime.id),
      supabase.from('anime_relations').select('relation_type_formatted, related_id').eq('anime_id', anime.id)
    ]);

    const translations = translationsResponse.data || [];
    const relations = relatedResponse.data || [];

    // --- ШАГ 3: Получаем информацию о связанных аниме (если они есть) ---
    let relatedAnimesWithInfo = [];
    if (relations.length > 0) {
      const relatedAnimeIds = relations.map(r => r.related_id);
      
      const { data: relatedInfo } = await supabase
        .from('animes')
        .select('id, shikimori_id, title, poster_url, year, type')
        .in('id', relatedAnimeIds);

      // Собираем все вместе, отфильтровывая "битые" связи, где relatedInfo не нашлось
      relatedAnimesWithInfo = relations
        .map(relation => {
          const animeInfo = relatedInfo?.find(a => a.id === relation.related_id);
          if (!animeInfo) return null; // Если связанное аниме не найдено, пропускаем
          return {
            ...animeInfo,
            relation_type_formatted: relation.relation_type_formatted,
          };
        })
        .filter(Boolean); // Убираем все null из массива
    }
    
    // --- ШАГ 4: Собираем финальный ответ ---
    const responseData = {
      ...anime,
      genres: (anime.genres || []).map((g: any) => g.genres).filter(Boolean),
      studios: (anime.studios || []).map((s: any) => s.studios).filter(Boolean),
      tags: (anime.tags || []).map((t: any) => t.tags).filter(Boolean),
      translations: translations,
      related: relatedAnimesWithInfo,
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error(`Anime detail API error for ID ${shikimoriId}:`, error);
    const message = error instanceof Error ? error.message : "Неизвестная ошибка";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
