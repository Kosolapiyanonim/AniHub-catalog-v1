// /app/api/anime/[id]/route.ts

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
    // 1. Находим наше аниме по shikimori_id
    const { data: anime, error: animeError } = await supabase
      .from('animes')
      .select('*')
      .eq('shikimori_id', shikimoriId)
      .single();

    if (animeError || !anime) {
      return NextResponse.json({ error: 'Anime not found' }, { status: 404 });
    }

    // 2. Параллельно запрашиваем озвучки и связанные произведения
    const [translationsResponse, relatedResponse] = await Promise.all([
      supabase.from('translations').select('*').eq('anime_id', anime.id),
      supabase.from('anime_relations').select('related_id, relation_type').eq('anime_id', anime.id)
    ]);
    
    if (translationsResponse.error) throw translationsResponse.error;
    if (relatedResponse.error) throw relatedResponse.error;

    const translations = translationsResponse.data;
    const relatedAnimeIds = relatedResponse.data.map(r => r.related_id);

    // 3. Если есть связанные аниме, запрашиваем их данные
    let relatedAnimesWithInfo = [];
    if (relatedAnimeIds.length > 0) {
        const { data: relatedInfo, error: relatedInfoError } = await supabase
            .from('animes')
            .select('id, shikimori_id, title, poster_url, type, year')
            .in('id', relatedAnimeIds);
        
        if (relatedInfoError) throw relatedInfoError;

        // Собираем все вместе: ID, тип связи и инфо
        relatedAnimesWithInfo = relatedResponse.data.map(relation => {
            const animeInfo = relatedInfo.find(a => a.id === relation.related_id);
            return {
                ...animeInfo,
                relation_type: relation.relation_type,
            };
        });
    }

    // 4. Собираем финальный ответ
    return NextResponse.json({
      ...anime,
      translations,
      related: relatedAnimesWithInfo,
    });

  } catch (error) {
    console.error("Anime detail API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
