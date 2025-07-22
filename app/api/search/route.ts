import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title");

  // Не ищем, если запрос слишком короткий (меньше 3 символов)
  if (!title || title.length < 3) {
    return NextResponse.json([]);
  }

  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    // Ищем по русскому И оригинальному названию
    const { data, error } = await supabase
      .from('animes')
       .select('shikimori_id, title, poster_url, year, type, status')
      .or(`title.ilike.%${title}%,title_orig.ilike.%${title}%`)
      .limit(8); // Ограничиваем количество результатов для скорости

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Search API error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
