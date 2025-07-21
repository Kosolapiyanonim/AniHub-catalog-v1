import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Эта функция парсит параметры из URL (например, "1-action,5-comedy") в массив ID ([1, 5])
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

    // --- ИСПОЛЬЗУЕМ НАШУ НОВУЮ ФУНКЦИЮ ДЛЯ ФИЛЬТРАЦИИ ПО ЖАНРАМ/СТУДИЯМ/ТЕГАМ ---
    const genreIds = parseIds(searchParams.get("genres"));
    const genreExcludeIds = parseIds(searchParams.get("genres_exclude"));
    const studioIds = parseIds(searchParams.get("studios"));
    const studioExcludeIds = parseIds(searchParams.get("studios_exclude"));
    const tagIds = parseIds(searchParams.get("tags"));
    const tagExcludeIds = parseIds(searchParams.get("tags_exclude"));

    // Вызываем нашу "умную" функцию из базы данных
    const { data: filteredAnimeIdsData, error: rpcError } = await supabase.rpc('filter_animes', {
        p_genres: genreIds,
        p_genres_exclude: genreExcludeIds,
        p_studios: studioIds,
        p_studios_exclude: studioExcludeIds,
        p_tags: tagIds,
        p_tags_exclude: tagExcludeIds,
    });
    
    if (rpcError) throw rpcError;
    const filteredAnimeIds = filteredAnimeIdsData.map(item => item.id);
    
    // Начинаем строить основной запрос
    let query = supabase
      .from("animes_with_details")
      .select(
        "*, episodes_aired, episodes_total, anime_kind, genres:anime_genres(genres(id, name, slug)), studios:anime_studios(studios(id, name, slug))",
        { count: "exact" }
      )
      .not("shikimori_id", "is", null)
      .not("poster_url", "is", null);

    // Если есть результат от функции фильтрации, используем его
    if (genreIds || genreExcludeIds || studioIds || studioExcludeIds || tagIds || tagExcludeIds) {
        if (filteredAnimeIds.length === 0) {
             return NextResponse.json({ results: [], total: 0, hasMore: false });
        }
        query = query.in('id', filteredAnimeIds);
    }
    
    // --- ПРИМЕНЯЕМ ОСТАЛЬНЫЕ ФИЛЬТРЫ ---
    const title = searchParams.get("title");
    if (title) query = query.ilike('title', `%${title}%`);

    const kinds = searchParams.get("kinds")?.split(",");
    if (kinds && kinds.length > 0) query = query.in("anime_kind", kinds);

    const statuses = searchParams.get("statuses")?.split(",");
    if (statuses && statuses.length > 0) query = query.in("status", statuses);

    const year_from = searchParams.get("year_from");
    if (year_from) query = query.gte("year", parseInt(year_from));

    const year_to = searchParams.get("year_to");
    if (year_to) query = query.lte("year", parseInt(year_to));
    
    // ... остальная логика (сортировка, пагинация, списки пользователя) остается без изменений ...
    query = query.order(sort, { ascending: order === "asc" }).range(offset, offset + limit - 1);

    const { data: results, count, error: queryError } = await query;
    if (queryError) throw queryError;

    // --- ОБРАБОТКА ДАННЫХ И ИНТЕГРАЦИЯ СПИСКОВ ---
    const finalResults = results?.map((anime) => ({
      ...anime,
      genres: anime.genres.map((g: any) => g.genres).filter(Boolean),
      studios: anime.studios.map((s: any) => s.studios).filter(Boolean),
    }));

    if (session && finalResults && finalResults.length > 0) {
      // ... код для добавления user_list_status ...
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
