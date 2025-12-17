// app/api/anime/[id]/route.ts

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import createClientAuth from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const shikimoriId = params.id;
  if (!shikimoriId) {
    return NextResponse.json({ error: "Shikimori ID is required" }, { status: 400 });
  }

  // Создаем публичный клиент для основных запросов (не зависит от JWT в cookies)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: "Supabase configuration missing" }, { status: 500 });
  }
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // --- ШАГ 1: Получаем пользователя (опционально) ---
    let user = null;
    try {
      const authClient = await createClientAuth();
      const { data: { user: authUser }, error: userError } = await authClient.auth.getUser();
      
      if (userError && userError.message?.includes('JWT')) {
        // JWT expired - игнорируем, работаем без пользователя
        console.log("JWT expired, continuing without user");
      } else if (userError) {
        console.log("Auth check failed, continuing without user:", userError);
      } else {
        user = authUser;
      }
    } catch (authError) {
      // Игнорируем ошибки авторизации - работаем без пользователя
      console.log("Auth check failed, continuing without user:", authError);
    }

    // --- ШАГ 2: Получаем основную информацию об аниме ---
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

    // --- ШАГ 3: Получаем статус аниме в списке пользователя (если он авторизован) ---
    let userListStatus: string | null = null;
    if (user) {
      try {
        const authClient = await createClientAuth();
        const { data: listData } = await authClient
          .from('user_lists')
          .select('status')
          .eq('user_id', user.id)
          .eq('anime_id', anime.id)
          .single();
        
        if (listData) {
          userListStatus = listData.status;
        }
      } catch (listError) {
        // Игнорируем ошибки при получении списков пользователя
        console.log("Failed to fetch user list status:", listError);
      }
    }

    // --- ШАГ 4: Получаем озвучки и связанные произведения параллельно ---
    const [translationsResponse, relatedResponse] = await Promise.all([
      supabase.from('translations').select('*').eq('anime_id', anime.id),
      supabase.from('anime_relations').select('relation_type_formatted, related_id').eq('anime_id', anime.id)
    ]);

    const translations = translationsResponse.data || [];
    const relations = relatedResponse.data || [];

    // --- ШАГ 5: Получаем информацию о связанных аниме (если они есть) ---
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
    
    // --- ШАГ 6: Собираем финальный ответ, добавляя статус пользователя ---
    const responseData = {
      ...anime,
      genres: (anime.genres || []).map((g: any) => g.genres).filter(Boolean),
      studios: (anime.studios || []).map((s: any) => s.studios).filter(Boolean),
      tags: (anime.tags || []).map((t: any) => t.tags).filter(Boolean),
      translations: translations,
      related: relatedAnimesWithInfo,
      user_list_status: userListStatus,
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error(`Anime detail API error for ID ${shikimoriId}:`, error);
    const message = error instanceof Error ? error.message : "Неизвестная ошибка";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
