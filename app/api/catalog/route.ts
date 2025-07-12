// /app/api/catalog/route.ts

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const parseIds = (param: string | null): number[] | null => {
  if (!param) return null;
  return param.split(',').map(item => parseInt(item.split('-')[0], 10)).filter(id => !isNaN(id));
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "25", 10);
  const offset = (page - 1) * limit;
  const sort = searchParams.get("sort") || "shikimori_votes";
  const order = searchParams.get("order") || "desc";

  try {
    const { data: { session } } = await supabase.auth.getSession();

    let query = supabase
      .from('animes_with_details')
      .select("id, shikimori_id, title, poster_url, year, type, status, shikimori_rating, episodes_count, weighted_rating", { count: 'exact' });

    // --- ПРИМЕНЯЕМ ВСЕ ФИЛЬТРЫ ---
    // (весь ваш код для фильтров остается здесь без изменений)
    const title = searchParams.get("title");
    if (title) query = query.or(`title.ilike.%${title}%,title_orig.ilike.%${title}%`);
    // ... и т.д.

    // --- ИСПРАВЛЕНИЕ: Стабильная сортировка ---
    const isAsc = order === 'asc';
    query = query.order(sort, { ascending: isAsc });
    // Добавляем вторую, уникальную сортировку для стабильности пагинации
    query = query.order('id', { ascending: false }); 
    
    // --- ПАГИНАЦИЯ ---
    query = query.range(offset, offset + limit - 1);

    const { data: results, count, error: queryError } = await query;
    if (queryError) throw queryError;

    // --- ИНТЕГРАЦИЯ СПИСКОВ ---
    if (session && results && results.length > 0) {
      const resultIds = results.map(r => r.id);
      const { data: userLists } = await supabase.from('user_lists').select('anime_id, status').eq('user_id', session.user.id).in('anime_id', resultIds);
      const statusMap = new Map(userLists?.map(item => [item.anime_id, item.status]));
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
    console.error("Catalog API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
