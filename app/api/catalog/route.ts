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
    const title = searchParams.get("title");
    if (title) query = query.or(`title.ilike.%${title}%,title_orig.ilike.%${title}%`);

    const types = searchParams.get("types")?.split(',');
    if (types && types.length > 0) query = query.in('type', types);
    
    const statuses = searchParams.get("statuses")?.split(',');
    if (statuses && statuses.length > 0) query = query.in('status', statuses);

    const year_from = searchParams.get("year_from");
    if (year_from) query = query.gte('year', parseInt(year_from));

    const year_to = searchParams.get("year_to");
    if (year_to) query = query.lte('year', parseInt(year_to));

    // ... другие фильтры ...

    // --- НОВЫЙ ФИЛЬТР ПО СПИСКАМ ПОЛЬЗОВАТЕЛЯ ---
    const user_list_status = searchParams.get("user_list_status");
    if (user_list_status && session) {
        const { data: animeIdsInList } = await supabase
            .from('user_lists')
            .select('anime_id')
            .eq('user_id', session.user.id)
            .eq('status', user_list_status);
        
        if (animeIdsInList && animeIdsInList.length > 0) {
            query = query.in('id', animeIdsInList.map(item => item.anime_id));
        } else {
            // Если в этом списке у пользователя нет аниме, возвращаем пустой результат
            query = query.in('id', [-1]);
        }
    }

    // --- ФИЛЬТРЫ ПО СВЯЗАННЫМ ТАБЛИЦАМ ---
    const applyRelationFilter = async (tableName: string, entityName: string, includeParam: string | null, excludeParam: string | null) => {
        const includeIds = parseIds(includeParam);
        if (includeIds && includeIds.length > 0) {
            const { data: animeIds } = await supabase.from(tableName).select('anime_id').in(`${entityName}_id`, includeIds);
            if (animeIds && animeIds.length > 0) {
                query = query.in('id', [...new Set(animeIds.map(item => item.anime_id))]);
            } else {
                query = query.in('id', [-1]);
            }
        }
        
        const excludeIds = parseIds(excludeParam);
        if (excludeIds && excludeIds.length > 0) {
            const { data: animeIdsToExclude } = await supabase.from(tableName).select('anime_id').in(`${entityName}_id`, excludeIds);
            if (animeIdsToExclude && animeIdsToExclude.length > 0) {
                query = query.not('id', 'in', `(${[...new Set(animeIdsToExclude.map(item => item.anime_id))].join(',')})`);
            }
        }
    };

    await applyRelationFilter('anime_genres', 'genre', searchParams.get("genres"), searchParams.get("genres_exclude"));
    await applyRelationFilter('anime_studios', 'studio', searchParams.get("studios"), searchParams.get("studios_exclude"));
    
    // --- СОРТИРОВКА И ПАГИНАЦИЯ ---
    query = query.order(sort, { ascending: order === 'asc' });
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
