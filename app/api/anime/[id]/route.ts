// /app/api/anime/[id]/route.ts

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const shikimoriId = params.id;
  if (!shikimoriId) {
    return NextResponse.json({ error: "Shikimori ID is required" }, { status: 400 });
  }

  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    // Делаем один мощный запрос, чтобы получить все и сразу
    const { data: anime, error } = await supabase
      .from('animes')
      .select(`
        *,
        translations(*),
        genres:anime_genres(genres(id, name, slug)),
        studios:anime_studios(studios(id, name, slug)),
        related:anime_relations!anime_id(
          relation_type,
          related_anime:animes!related_id(id, shikimori_id, title, poster_url, year, type)
        )
      `)
      .eq('shikimori_id', shikimoriId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Код ошибки "не найдено"
        return NextResponse.json({ error: 'Anime not found' }, { status: 404 });
      }
      throw error;
    }
    
    // Форматируем данные для удобства фронтенда
    const responseData = {
      ...anime,
      genres: anime.genres.map((g: any) => g.genres).filter(Boolean),
      studios: anime.studios.map((s: any) => s.studios).filter(Boolean),
      related: anime.related.map((r: any) => ({
        ...r.related_anime,
        relation_type: r.relation_type,
      })).filter(r => r.shikimori_id), // Убираем "битые" связи
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error("Anime detail API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
