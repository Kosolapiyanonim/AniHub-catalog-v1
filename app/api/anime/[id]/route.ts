// app/api/anime/[id]/route.ts

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
    // --- [ИЗМЕНЕНИЕ] Сначала получаем сессию пользователя ---
    const { data: { session } } = await supabase.auth.getSession();

    // --- ШАГ 1: Получаем основную информацию об аниме ---
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
      if (animeError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Аниме не найдено' }, { status: 404 });
      }
      throw animeError;
    }

    // --- ШАГ 2: Получаем озвучки и связанные произведения ---
    const [translationsResponse, relatedResponse] = await Promise.all([
      supabase.from('translations').select('*').eq('anime_id', anime.id),
      supabase.from('anime_relations').select('relation_type_formatted, related_id').eq('anime_id', anime.id)
    ]);

    const translations = translationsResponse.data || [];
    const relations = relatedResponse.data || [];

    // --- [ИЗМЕНЕНИЕ] ШАГ 3: Получаем статус аниме в списке пользователя (если он авторизован) ---
    let userListStatus: string | null = null;
    if (session) {
      const { data: listData } = await supabase
        .from('user_lists')
        .select('status')
        .eq('user_id', session.user.id)
        .eq('anime_id', anime.id)
        .single();
      
      if (listData) {
        userListStatus = listData.status;
      }
    }

    // --- ШАГ 4: Получаем информацию о связанных аниме ---
    let relatedAnimesWithInfo = [];
    if (relations.length > 0) {
      const relatedAnimeIds = relations.map(r => r.related_id);
      
      const { data: relatedInfo } = await supabase
        .from('animes')
        .select('id, shikimori_id, title, poster_url, year, type')
        .in('id', relatedAnimeIds);

      relatedAnimesWithInfo = relations
        .map(relation => {
          const animeInfo = relatedInfo?.find(a => a.id === relation.related_id);
          if (!animeInfo) return null;
          return {
            ...animeInfo,
            relation_type_formatted: relation.relation_type_formatted,
          };
        })
        .filter(Boolean);
    }
    
    // --- ШАГ 5: Собираем финальный ответ, добавляя статус пользователя ---
    const responseData = {
      ...anime,
      genres: (anime.genres || []).map((g: any) => g.genres).filter(Boolean),
      studios: (anime.studios || []).map((s: any) => s.studios).filter(Boolean),
      tags: (anime.tags || []).map((t: any) => t.tags).filter(Boolean),
      translations: translations,
      related: relatedAnimesWithInfo,
      user_list_status: userListStatus, // <-- Вот оно!
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error(`Anime detail API error for ID ${shikimoriId}:`, error);
    const message = error instanceof Error ? error.message : "Неизвестная ошибка";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
