// /app/api/catalog/route.ts
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// ... (вспомогательная функция parseIds остается без изменений)

export async function GET(request: Request) {
  // ... (парсинг параметров page, limit, sort, order остается без изменений)
  
  try {
    const { data: { session } } = await supabase.auth.getSession();

    // ... (логика построения query с фильтрами остается без изменений) ...

    const { data: results, count, error: queryError } = await query;
    if (queryError) throw queryError;

    // ИЗМЕНЕНИЕ: Если пользователь авторизован, получаем статусы для загруженных аниме
    if (session && results && results.length > 0) {
      const resultIds = results.map(r => r.id);
      const { data: userLists } = await supabase
        .from('user_lists')
        .select('anime_id, status')
        .eq('user_id', session.user.id)
        .in('anime_id', resultIds);

      const statusMap = new Map(userLists?.map(item => [item.anime_id, item.status]));
      
      // Добавляем статус к каждому аниме
      results.forEach((anime: any) => {
        anime.user_list_status = statusMap.get(anime.id) || null;
      });
    }

    return NextResponse.json({
      results: results || [],
      total: count,
      hasMore: count ? count > offset + limit : false,
    });

  } catch (error) {
    // ... (обработка ошибок)
  }
}
