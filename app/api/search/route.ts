import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title");

  if (!title || title.length < 3) {
    return NextResponse.json([]);
  }

  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    // [ИЗМЕНЕНИЕ] Запрашиваем raw_data, где лежит вся нужная нам информация
    const { data, error } = await supabase
      .from('animes')
      .select('shikimori_id, title, poster_url, raw_data') // Запрашиваем raw_data
      .or(`title.ilike.%${title}%,title_orig.ilike.%${title}%`)
      .limit(8);

    if (error) throw error;

    // [ИЗМЕНЕНИЕ] Сразу извлекаем нужные поля из raw_data на сервере
    const results = data?.map(anime => {
        const material = anime.raw_data?.material_data || {};
        return {
            shikimori_id: anime.shikimori_id,
            title: anime.title,
            poster_url: anime.poster_url,
            // Извлекаем нужные поля прямо здесь
            type: anime.raw_data?.type,
            status: material.anime_status,
            aired_at: material.aired_at
        }
    }) || [];

    return NextResponse.json(results);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Search API error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
