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
  const sort = searchParams.get("sort") || "weighted_rating";
  const order = searchParams.get("order") || "desc";

  try {
    const { data: { session } } = await supabase.auth.getSession();

    // 1. ПОЧИНАЄМО БУДУВАТИ ЗАПИТ ДО НАШОГО НОВОГО VIEW
    let query = supabase
      .from('animes_with_details') // <-- ЗМІНА: Запитуємо з VIEW, а не з таблиці
      .select("id, shikimori_id, title, poster_url, year, type, shikimori_rating, episodes_count, weighted_rating", { count: 'exact' });

    // 2. ЗАСТОСОВУЄМО ФІЛЬТРИ
    const title = searchParams.get("title");
    if (title) query = query.or(`title.ilike.%${title}%,title_orig.ilike.%${title}%`);

    const types = searchParams.get("types")?.split(',');
    if (types) query = query.in('type', types);
    
    // ... тут можна буде додати решту фільтрів за аналогією

    // 3. ЗАСТОСОВУЄМО СОРТУВАННЯ
    // Тепер це працює, оскільки 'weighted_rating' - це звичайна колонка в нашому VIEW
    query = query.order(sort, { ascending: order === 'asc' });

    // 4. ЗАСТОСОВУЄМО ПАГІНАЦІЮ
    query = query.range(offset, offset + limit - 1);

    const { data: results, count, error: queryError } = await query;
    if (queryError) throw queryError;

    // 5. ІНТЕГРАЦІЯ СПИСКІВ (як і раніше)
    if (session && results && results.length > 0) {
      const resultIds = results.map(r => r.id);
      const { data: userLists } = await supabase
        .from('user_lists')
        .select('anime_id, status')
        .eq('user_id', session.user.id)
        .in('anime_id', resultIds);

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
