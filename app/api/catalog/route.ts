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

    // --- [НОВЫЙ БЛОК] СНАЧАЛА ПОЛУЧАЕМ ID ИЗ СПИСКА ПОЛЬЗОВАТЕЛЯ, ЕСЛИ ФИЛЬТР АКТИВЕН ---
    const user_list_status = searchParams.get("user_list_status");
    let userListIds: number[] | null = null;

    if (user_list_status && session) {
      const { data: animeIdsInList, error: listError } = await supabase
        .from("user_lists")
        .select("anime_id")
        .eq("user_id", session.user.id)
        .eq("status", user_list_status);

      if (listError) throw listError;
      
      if (!animeIdsInList || animeIdsInList.length === 0) {
        // Если в списке пользователя по этому статусу ничего нет, возвращаем пустой результат
        return NextResponse.json({ results: [], total: 0, hasMore: false });
      }
      // Сохраняем ID аниме из списка пользователя
      userListIds = animeIdsInList.map((item) => item.anime_id);
    }
    // --- КОНЕЦ НОВОГО БЛОКА ---

    // Начинаем строить основной запрос
    let query = supabase
      .from("animes_with_details")
      .select(
        "*, episodes_aired, episodes_total, anime_kind, genres:anime_genres(genres(id, name, slug)), studios:anime_studios(studios(id, name, slug))",
        { count: "exact" }
      )
      .not("shikimori_id", "is", null)
      .not("poster_url", "is", null);

    // --- [ИЗМЕНЕНИЕ] СРАЗУ ПРИМЕНЯЕМ ФИЛЬТР ПО ID ИЗ СПИСКА ПОЛЬЗОВАТЕЛЯ, ЕСЛИ ОН ЕСТЬ ---
    if (userListIds) {
      query = query.in('id', userListIds);
    }

    // --- Фильтрация по жанрам, студиям и тегам через функцию ---
    const genreIds = parseIds(searchParams.get("genres"));
    const studioIds = parseIds(searchParams.get("studios"));
    // ... и т.д. ...

    if (genreIds || studioIds /*...*/) {
      const { data: filteredAnimeIdsData, error: rpcError } = await supabase.rpc('filter_animes', { /*...*/ });
      if (rpcError) throw rpcError;
      const filteredAnimeIds = filteredAnimeIdsData.map((item: any) => item.id);
      
      if (filteredAnimeIds.length === 0) {
           return NextResponse.json({ results: [], total: 0, hasMore: false });
      }
      query = query.in('id', filteredAnimeIds);
    }
    
    // --- ПРИМЕНЯЕМ ОСТАЛЬНЫЕ ФИЛЬТРЫ ---
    const title = searchParams.get("title");
    if (title) query = query.ilike('title', `%${title}%`);
    
    // ... остальная логика (kinds, statuses, year, сортировка, пагинация) ...
     const kinds = searchParams.get("kinds")?.split(",");
    if (kinds && kinds.length > 0) query = query.in("anime_kind", kinds);

    const statuses = searchParams.get("statuses")?.split(",");
    if (statuses && statuses.length > 0) query = query.in("status", statuses);

    const year_from = searchParams.get("year_from");
    if (year_from) query = query.gte("year", parseInt(year_from));

    const year_to = searchParams.get("year_to");
    if (year_to) query = query.lte("year", parseInt(year_to));
    
    query = query.order(sort, { ascending: order === "asc" }).range(offset, offset + limit - 1);

    const { data: results, count, error: queryError } = await query;
    if (queryError) throw queryError;

    // --- ОБРАБОТКА ДАННЫХ И ИНТЕГРАЦИЯ СПИСКОВ ---
    // Этот код был неполным в вашем примере, я его дополнил, чтобы он работал
    const finalResults = results?.map((anime) => ({
      ...anime,
      genres: anime.genres.map((g: any) => g.genres).filter(Boolean),
      studios: anime.studios.map((s: any) => s.studios).filter(Boolean),
    }));

    if (session && finalResults && finalResults.length > 0) {
      const resultIds = finalResults.map((r) => r.id);
      const { data: userListsData } = await supabase
        .from("user_lists")
        .select("anime_id, status")
        .eq("user_id", session.user.id)
        .in("anime_id", resultIds);
      
      if (userListsData) {
        const statusMap = new Map(userListsData.map((item) => [item.anime_id, item.status]));
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
