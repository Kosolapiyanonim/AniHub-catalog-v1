// /app/api/catalog/route.ts

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Функция для парсинга ID из id-slug формата
const parseIds = (param: string | null): number[] | null => {
  if (!param) return null;
  return param.split(',').map(item => parseInt(item.split('-')[0], 10)).filter(id => !isNaN(id));
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  // 1. ПАРАМЕТРЫ ПАГИНАЦИИ И СОРТИРОВКИ
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "24", 10);
  const offset = (page - 1) * limit;
  const sort = searchParams.get("sort") || "weighted_rating";
  const order = searchParams.get("order") || "desc";

  // 2. СОБИРАЕМ ВСЕ ПАРАМЕТРЫ ФИЛЬТРОВ
  const filterParams = {
    p_title: searchParams.get("title") || null,
    p_types: searchParams.get("types")?.split(',') || null,
    p_statuses: searchParams.get("statuses")?.split(',') || null,
    p_year_from: searchParams.get("year_from") ? parseInt(searchParams.get("year_from")!) : null,
    p_year_to: searchParams.get("year_to") ? parseInt(searchParams.get("year_to")!) : null,
    p_rating_from: searchParams.get("rating_from") ? parseFloat(searchParams.get("rating_from")!) : null,
    p_rating_to: searchParams.get("rating_to") ? parseFloat(searchParams.get("rating_to")!) : null,
    p_episodes_from: searchParams.get("episodes_from") ? parseInt(searchParams.get("episodes_from")!) : null,
    p_episodes_to: searchParams.get("episodes_to") ? parseInt(searchParams.get("episodes_to")!) : null,
    p_include_genres: parseIds(searchParams.get("genres")),
    p_exclude_genres: parseIds(searchParams.get("genres_exclude")),
    p_include_studios: parseIds(searchParams.get("studios")),
    p_exclude_studios: parseIds(searchParams.get("studios_exclude")),
    p_include_countries: parseIds(searchParams.get("countries")),
    p_exclude_countries: parseIds(searchParams.get("countries_exclude")),
  };

  try {
    // 3. ВЫЗЫВАЕМ НАШУ ФУНКЦИЮ В БАЗЕ ДАННЫХ, ЧТОБЫ ПОЛУЧИТЬ ID ПОДХОДЯЩИХ АНИМЕ
    const { data: filteredIdsData, error: rpcError } = await supabase.rpc('filter_animes', filterParams);

    if (rpcError) throw rpcError;

    const animeIds = filteredIdsData.map((item: { id: number }) => item.id);
    const total = animeIds.length;

    if (total === 0) {
      return NextResponse.json({ results: [], total: 0, hasMore: false });
    }

    // 4. ДЕЛАЕМ ОСНОВНОЙ ЗАПРОС, ВЫБИРАЯ АНИМЕ ПО НАЙДЕННЫМ ID
    let query = supabase
      .from("animes")
      .select("id, shikimori_id, title, poster_url, year, type, shikimori_rating, episodes_count")
      .in('id', animeIds);

    // 5. ПРИМЕНЯЕМ СОРТИРОВКУ
    if (sort === 'weighted_rating') {
      // Для "честного" рейтинга мы добавляем вычисляемое поле и сортируем по нему
      query = query.select(`
        *,
        weighted_rating:calculate_weighted_rating(shikimori_rating, shikimori_votes)
      `).order('weighted_rating', { ascending: order === 'asc' });
    } else {
      // Для остальных полей сортируем как обычно
      query = query.order(sort, { ascending: order === 'asc' });
    }

    // 6. ПРИМЕНЯЕМ ПАГИНАЦИЮ
    query = query.range(offset, offset + limit - 1);

    const { data: results, error: queryError } = await query;
    if (queryError) throw queryError;

    return NextResponse.json({
      results: results || [],
      total,
      hasMore: total > offset + limit,
    });

  } catch (error) {
    console.error("Catalog API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
