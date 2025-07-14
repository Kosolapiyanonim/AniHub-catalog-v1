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
      .select("*, genres:anime_genres(genres(name))", { count: 'exact' })
      .not('shikimori_id', 'is', null)
      .not('poster_url', 'is', null);

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
            return NextResponse.json({ results: [], total: 0, hasMore: false });
        }
    }

    const title = searchParams.get("title");
    if (title) query = query.or(`title.ilike.%${title}%,title_orig.ilike.%${title}%`);
    
    const isAsc = order === 'asc';
    query = query.order(sort, { ascending: isAsc, nullsFirst: false });
    query = query.order('id', { ascending: false });
    query = query.range(offset, offset + limit - 1);

    const { data: results, count, error: queryError } = await query;
    if (queryError) throw queryError;
    
    const finalResults = results?.map(anime => ({
        ...anime,
        genres: anime.genres.map((g: any) => g.genres).filter(Boolean),
    }));

    if (session && finalResults && finalResults.length > 0) {
      const resultIds = finalResults.map(r => r.id);
      const { data: userLists } = await supabase.from('user_lists').select('anime_id, status').eq('user_id', session.user.id).in('anime_id', resultIds);
      if (userLists) {
          const statusMap = new Map(userLists.map(item => [item.anime_id, item.status]));
          finalResults.forEach((anime: any) => {
            anime.user_list_status = statusMap.get(anime.id) || null;
          });
      }
    }

    return NextResponse.json({
      results: finalResults || [],
      total: count,
      hasMore: count ? count > offset + limit : false,
    });

  } catch (error) {
    console.error("Catalog API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
