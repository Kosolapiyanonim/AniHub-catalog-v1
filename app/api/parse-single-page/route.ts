// Создайте файл: /app/api/parse-single-page/route.ts

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { KodikAnimeData } from "@/lib/types";

// Вспомогательная функция для обработки связей (жанры, студии, страны)
async function processRelations(
  supabaseClient: any,
  anime_id: number,
  items: string[] | undefined,
  relation_type: "genre" | "studio" | "country"
) {
  if (!items || items.length === 0) return;
  const tableName = relation_type === "country" ? "countries" : `${relation_type}s`;
  
  for (const name of items) {
    if (!name?.trim()) continue;
    try {
      const { data: relData } = await supabaseClient
        .from(tableName)
        .upsert({ name: name.trim() }, { onConflict: "name" })
        .select("id")
        .single();

      if (relData) {
        await supabaseClient
          .from("anime_relations")
          .upsert(
            { anime_id, relation_id: relData.id, relation_type },
            { onConflict: "anime_id,relation_id,relation_type" }
          );
      }
    } catch (error) {
      // Игнорируем ошибки, чтобы не останавливать парсинг
    }
  }
}

export async function POST(request: Request) {
  const KODIK_TOKEN = process.env.KODIK_API_TOKEN;
  if (!KODIK_TOKEN) {
    return NextResponse.json({ error: "KODIK_API_TOKEN не настроен" }, { status: 500 });
  }

  try {
    const { page } = await request.json();
    if (!page || typeof page !== 'number') {
      return NextResponse.json({ error: "Необходимо указать номер страницы (page)" }, { status: 400 });
    }

    const kodikApiUrl = `https://kodikapi.com/list?token=${KODIK_TOKEN}&types=anime,anime-serial&with_material_data=true&limit=100&page=${page}`;
    
    const response = await fetch(kodikApiUrl);
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка от API Kodik: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const animeList: KodikAnimeData[] = data.results || [];

    if (animeList.length === 0) {
      return NextResponse.json({
        message: `Страница ${page} пуста или это конец.`,
        processed: 0,
        hasNextPage: !!data.next_page,
      });
    }

    let processedCount = 0;
    for (const anime of animeList) {
      if (!anime.shikimori_id) continue;

      const material = anime.material_data || {};
      const record = {
        kodik_id: anime.id,
        shikimori_id: anime.shikimori_id,
        kinopoisk_id: anime.kinopoisk_id,
        title: anime.title,
        title_orig: anime.title_orig,
        year: anime.year,
        poster_url: material.anime_poster_url || material.poster_url,
        player_link: anime.link,
        description: material.description || material.anime_description,
        type: anime.type,
        status: material.anime_status,
        episodes_count: anime.episodes_count || material.episodes_total,
        rating_mpaa: material.rating_mpaa,
        kinopoisk_rating: material.kinopoisk_rating,
        shikimori_rating: material.shikimori_rating,
        kinopoisk_votes: material.kinopoisk_votes,
        shikimori_votes: material.shikimori_votes,
        screenshots: { screenshots: anime.screenshots || [] },
        updated_at_kodik: anime.updated_at,
      };

      const { data: upserted, error } = await supabase
        .from('animes')
        .upsert(record, { onConflict: 'shikimori_id' })
        .select('id')
        .single();

      if (error) {
        console.error(`Ошибка сохранения '${anime.title}':`, error.message);
        continue;
      }

      await processRelations(supabase, upserted.id, material.anime_genres, 'genre');
      await processRelations(supabase, upserted.id, material.anime_studios, 'studio');
      await processRelations(supabase, upserted.id, material.countries, 'country');
      processedCount++;
    }

    return NextResponse.json({
      message: `Страница ${page} обработана. Сохранено/обновлено: ${processedCount} из ${animeList.length}.`,
      processed: processedCount,
      hasNextPage: !!data.next_page,
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : "Неизвестная ошибка";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
