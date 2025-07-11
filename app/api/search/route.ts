// /app/api/search/route.ts

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
  }

  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  // Преобразуем поисковый запрос в формат, понятный для полнотекстового поиска
  // 'ван пис' -> 'ван & пис'
  const tsQuery = query.trim().split(' ').filter(Boolean).join(' & ');

  try {
    const { data, error } = await supabase
      .from('animes')
      .select('id, shikimori_id, title, poster_url, year, type')
      .textSearch('ts_document', tsQuery, {
        type: 'websearch', // Используем более "гибкий" тип поиска
        config: 'russian'
      })
      .limit(10); // Ограничиваем количество результатов

    if (error) throw error;

    return NextResponse.json(data);

  } catch (error) {
    console.error("Search API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
