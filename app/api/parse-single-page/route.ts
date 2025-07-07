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
      // Игнорируем ошибки
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
      if (!anime.shikimori_id) {
        continue;
      }

      const material = anime.material_data || {};
      
      // **ИСПРАВЛЕНИЕ:** В этом объекте больше нет поля kodik_id,
      // так как мы его удалили из таблицы animes.
      const animeRecord = {
        shikimori_id: anime.shikimori_id,
        kinopoisk_id: anime.kinopoisk_id,
        title: material.anime_title || anime.title,
        title_orig: anime.title_orig,
        year: anime.year,
        poster_url: material.anime_poster_url || material.poster_url,
        description: material.anime_description || material.description,
        type: anime.type,
        status: material.anime_status,
        episodes_count: anime.episodes_count || material.episodes_total,
        rating_mpaa: material.rating_mpaa,
        kinopoisk_rating: material.kinopoisk_rating,
        imdb_rating: material.imdb_rating,
        shikimori_rating: material.shikimori_rating,
        kinopoisk_votes: material.kinopoisk_votes,
        shikimori_votes: material.shikimori_votes,
        screenshots: { screenshots: anime.screenshots || [] },
        updated_at_kodik: anime.updated_at,
      };

      const { data: upsertedAnime, error: animeError } = await supabase
        .from('animes')
        .upsert(animeRecord, { onConflict: 'shikimori_id' })
        .select('id')
        .single();

      if (animeError) {
        console.error(`Ошибка сохранения аниме '${anime.title}':`, animeError.message);
        continue;
      }

      // Информация об озвучке сохраняется в отдельную таблицу 'translations'
      const translationRecord = {
          anime_id: upsertedAnime.id,
          kodik_id: anime.id,
          title: anime.translation.title,
          type: anime.translation.type,
          quality: anime.quality,
          player_link: anime.link,
      };

      const { error: translationError } = await supabase
        .from('translations')
        .upsert(translationRecord, { onConflict: 'kodik_id' });
      
      if (translationError) {
          console.error(`Ошибка сохранения озвучки для '${anime.title}':`, translationError.message);
          continue;
      }

      await processRelations(supabase, upsertedAnime.id, material.anime_genres, 'genre');
      await processRelations(supabase, upsertedAnime.id, material.anime_studios, 'studio');
      await processRelations(supabase, upsertedAnime.id, material.countries, 'country');
      
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
