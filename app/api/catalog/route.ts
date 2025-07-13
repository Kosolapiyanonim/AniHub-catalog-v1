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
      .select("id, shikimori_id, title, poster_url, year, type, status, shikimori_rating, episodes_count, weighted_rating", { count: 'exact' })
      .not('shikimori_id', 'is', null)
      .not('poster_url', 'is', null);

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

    const rating_from = searchParams.get("rating_from");
    if (rating_from) query = query.gte('shikimori_rating', parseFloat(rating_from));
    
    const rating_to = searchParams.get("rating_to");
    if (rating_to) query = query.lte('shikimori_rating', parseFloat(rating_to));

    const episodes_from = searchParams.get("episodes_from");
    if (episodes_from) query = query.gte('episodes_count', parseInt(episodes_from));

    const episodes_to = searchParams.get("episodes_to");
    if (episodes_to) query = query.lte('episodes_count', parseInt(episodes_to));

    // --- ФИЛЬТРЫ ПО СВЯЗАННЫМ ТАБЛИЦАМ ---
    const applyRelationFilter = async (tableName: string, entityName: string, includeParam: string | null, excludeParam: string | null) => {
        let animeIdsToFilter: number[] | null = null;

        const includeIds = parseIds(includeParam);
        if (includeIds && includeIds.length > 0) {
            const { data: animeIds } = await supabase.from(tableName).select('anime_id').in(`${entityName}_id`, includeIds);
            if (animeIds) {
                animeIdsToFilter = animeIds.map(item => item.anime_id);
            }
        }

        if (animeIdsToFilter !== null) {
            query = query.in('id', animeIdsToFilter.length > 0 ? [...new Set(animeIdsToFilter)] : [-1]);
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
    await applyRelationFilter('anime_tags', 'tag', searchParams.get("tags"), searchParams.get("tags_exclude"));
    
    // --- СОРТИРОВКА И ПАГИНАЦИЯ ---
    const isAsc = order === 'asc';
    query = query.order(sort, { ascending: isAsc, nullsFirst: false });
    query = query.order('id', { ascending: false }); // Стабильная сортировка
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
