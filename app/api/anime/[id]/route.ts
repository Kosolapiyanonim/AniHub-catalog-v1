// /app/api/anime/[id]/route.ts

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Мы будем использовать shikimori_id как основной идентификатор в URL
  const shikimoriId = params.id;
  if (!shikimoriId) {
    return NextResponse.json({ error: "Shikimori ID is required" }, { status: 400 });
  }

  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    // Делаем один мощный запрос, чтобы получить все и сразу, используя VIEW
    const { data: anime, error } = await supabase
      .from('animes_with_details') // Используем наше "умное" представление
      .select(`
        *, 
        translations(*),
        genres:anime_genres(genres(id, name, slug)),
        studios:anime_studios(studios(id, name, slug)),
        tags:anime_tags(tags(id, name, slug)),
        related:anime_relations!anime_id(
          relation_type,
          relation_type_formatted,
          related_anime:animes!related_id(id, shikimori_id, title, poster_url, year, type)
        )
      `)
      .eq('shikimori_id', shikimoriId)
      .single();

    if (error) {
      // Если аниме не найдено, возвращаем 404
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Anime not found' }, { status: 404 });
      }
      throw error;
    }
    
    // Форматируем данные для удобства фронтенда
    const responseData = {
      ...anime,
      // Преобразуем массив объектов в простой массив
      genres: (anime.genres || []).map((g: any) => g.genres).filter(Boolean),
      studios: (anime.studios || []).map((s: any) => s.studios).filter(Boolean),
      tags: (anime.tags || []).map((t: any) => t.tags).filter(Boolean),
      // Обрабатываем связанные аниме, отфильтровывая "битые" связи
      related: (anime.related || [])
        .map((r: any) => {
          if (r && r.related_anime && r.related_anime.shikimori_id) {
            return {
              ...r.related_anime,
              relation_type_formatted: r.relation_type_formatted,
            };
          }
          return null;
        })
        .filter(Boolean),
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error(`Anime detail API error for ID ${shikimoriId}:`, error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
