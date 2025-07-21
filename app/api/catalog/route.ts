import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const parseIds = (param: string | null): number[] | null => {
  if (!param) return null;
  const ids = param.split(",").map(item => parseInt(item.split("-")[0], 10)).filter(id => !isNaN(id));
  return ids.length > 0 ? ids : null;
};

export const dynamic = 'force-dynamic';

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

    // --- НАЧИНАЕМ СТРОИТЬ ОСНОВНОЙ ЗАПРОС ---
    let query = supabase
      .from("animes_with_details")
      .select(
        "*, episodes_aired, episodes_total, anime_kind, genres:anime_genres(genres(id, name, slug)), studios:anime_studios(studios(id, name, slug))",
        { count: "exact" }
      )
      .not("shikimori_id", "is", null)
      .not("poster_url", "is", null);

    // --- [ВОЗВРАЩАЕМ ЭТОТ БЛОК] ЛОГИКА ФИЛЬТРАЦИИ ПО СПИСКАМ ПОЛЬЗОВАТЕЛЯ ---
    const user_list_status = searchParams.get("user_list_status");
    if (user_list_status && session) {
      const { data: animeIdsInList } = await supabase
        .from("user_lists")
        .select("anime_id")
        .eq("user_id", session.user.id)
        .eq("status", user_list_status);

      // Если в списке пользователя ничего нет, то и в каталоге ничего не показываем
      if (!animeIdsInList || animeIdsInList.length === 0) {
        return NextResponse.json({ results: [], total: 0, hasMore: false });
      }
      
      const ids = animeIdsInList.map((item) => item.anime_id);
      query = query.in('id', ids);
    }
    // --- КОНЕЦ ВОЗВРАЩЕННОГО БЛОКА ---

    // --- Фильтрация по жанрам, студиям и тегам через функцию ---
    const genreIds = parseIds(searchParams.get("genres"));
    const studioIds = parseIds(searchParams.get("studios"));
    // ... (можно добавить другие по аналогии) ...

    if (genreIds || studioIds) {
      const { data: filteredAnimeIdsData } = await supabase.rpc('filter_animes', {
          p_genres: genreIds, p_genres_exclude: null,
          p_studios: studioIds, p_studios_exclude: null,
          p_tags: null, p_tags_exclude: null,
      });
      const filteredAnimeIds = filteredAnimeIdsData.map((item: any) => item.id);
      if (filteredAnimeIds.length === 0) {
           return NextResponse.json({ results: [], total: 0, hasMore: false });
      }
      query = query.in('id', filteredAnimeIds);
    }
    
    // --- ПРИМЕНЯЕМ ОСТАЛЬНЫЕ ФИЛЬТРЫ ---
    const title = searchParams.get("title");
    if (title) query = query.ilike('title', `%${title}%`);

    // ... (остальная логика фильтров: kinds, statuses, year) ...

    // --- Сортировка и пагинация ---
    query = query.order(sort, { ascending: order === "asc" }).range(offset, offset + limit - 1);

    const { data: results, count, error: queryError } = await query;
    if (queryError) throw queryError;

    const finalResults = results?.map((anime) => ({ /* ... маппинг ... */ }));

    if (session && finalResults && finalResults.length > 0) {
      // ... код для добавления user_list_status в ответ ...
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
