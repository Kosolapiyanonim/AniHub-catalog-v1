// Замените содержимое файла: /app/api/parse-single-page/route.ts

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
    const { nextPageUrl } = await request.json();
    
    const baseUrl = "https://kodikapi.com/list";
    const requestUrl = nextPageUrl 
      ? `https://kodikapi.com${nextPageUrl}` 
      : `${baseUrl}?token=${KODIK_TOKEN}&types=anime,anime-serial&with_material_data=true&limit=100`;

    const response = await fetch(requestUrl);
    if (!response.ok) {
        const errorText = await response.text();
        try {
            const errorJson = JSON.parse(errorText);
            throw new Error(`Ошибка от API Kodik: ${response.status} - ${errorJson.error || errorText}`);
        } catch {
            throw new Error(`Ошибка от API Kodik: ${response.status} - ${errorText}`);
        }
    }

    const data = await response.json();
    const animeList: KodikAnimeData[] = data.results || [];

    if (animeList.length === 0) {
      return NextResponse.json({
        message: `Страница пуста или это конец.`,
        processed: 0,
        nextPageUrl: data.next_page || null,
      });
    }

    let processedCount = 0;
    for (const anime of animeList) {
      const material = anime.material_data || {};
      
      // **ИСПРАВЛЕНИЕ:** Реализована логика приоритетов при создании записи
      const record = {
        kodik_id: anime.id,
        shikimori_id: anime.shikimori_id,
        kinopoisk_id: anime.kinopoisk_id,

        // Приоритет названий: Shikimori -> Kodik
        title: material.anime_title || anime.title,
        title_orig: anime.title_orig,

        year: anime.year,

        // Приоритет постера: Shikimori -> Другой источник
        poster_url: material.anime_poster_url || material.poster_url,

        player_link: anime.link,

        // Приоритет описания: Shikimori -> Другой источник
        description: material.anime_description || material.description,

        type: anime.type,

        // Приоритет статуса: Shikimori
        status: material.anime_status,

        episodes_count: anime.episodes_count || material.episodes_total,
        rating_mpaa: material.rating_mpaa,

        // Рейтинги и голоса сохраняются из всех доступных источников
        kinopoisk_rating: material.kinopoisk_rating,
        imdb_rating: material.imdb_rating,
        shikimori_rating: material.shikimori_rating,

        kinopoisk_votes: material.kinopoisk_votes,
        shikimori_votes: material.shikimori_votes,

        screenshots: { screenshots: anime.screenshots || [] },
        updated_at_kodik: anime.updated_at,
      };

      const { data: upserted, error } = await supabase
        .from('animes')
        .upsert(record, { onConflict: 'kodik_id' })
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
      message: `Обработано. Сохранено/обновлено: ${processedCount} из ${animeList.length}.`,
      processed: processedCount,
      nextPageUrl: data.next_page || null,
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : "Неизвестная ошибка";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
