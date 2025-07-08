// Замените содержимое файла: /app/api/parse-single-page/route.ts

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { KodikAnimeData } from "@/lib/types";

// НАЧАЛО КОДА ДЛЯ КОПИРОВАНИЯ

async function processRelations(
    supabaseClient: any,
    items: { name: string }[],
    tableName: string,
    relationTableName: string,
    animeId: number,
    idFieldName: string
) {
    if (!items || items.length === 0) return;

    const { data: existingItems } = await supabaseClient
        .from(tableName)
        .upsert(items, { onConflict: 'name' })
        .select('id, name');

    if (!existingItems) return;

    const itemMap = new Map(existingItems.map(item => [item.name, item.id]));

    const relationsToUpsert = items
        .map(item => {
            const itemId = itemMap.get(item.name);
            if (!itemId) return null;
            return {
                anime_id: animeId,
                [idFieldName]: itemId,
            };
        })
        .filter(Boolean);

    if (relationsToUpsert.length > 0) {
        await supabaseClient
            .from(relationTableName)
            .upsert(relationsToUpsert);
    }
}

async function processAllRelations(
    supabaseClient: any,
    relationsToProcess: {
        shikimori_id: string;
        genres?: string[];
        studios?: string[];
        countries?: string[];
    }[],
    animeIdMap: Map<string, number>
) {
    for (const relationData of relationsToProcess) {
        const animeId = animeIdMap.get(relationData.shikimori_id);
        if (!animeId) continue;

        if (relationData.genres) {
            await processRelations(supabaseClient, relationData.genres.map(name => ({ name })), 'genres', 'anime_genres', animeId, 'genre_id');
        }
        if (relationData.studios) {
            await processRelations(supabaseClient, relationData.studios.map(name => ({ name })), 'studios', 'anime_studios', animeId, 'studio_id');
        }
        if (relationData.countries) {
            await processRelations(supabaseClient, relationData.countries.map(name => ({ name })), 'countries', 'anime_countries', animeId, 'country_id');
        }
    }
}

// КОНЕЦ КОДА ДЛЯ КОПИРОВАНИЯ

// ... (функция processAllRelations остается той же)

// Новая функция для обработки тегов
async function processTags(supabaseClient: any, animeId: number, tags: string[] | undefined) {
    if (!tags || tags.length === 0) return;

    const { data: tagsData } = await supabaseClient.from('tags').upsert(tags.map(name => ({ name })), { onConflict: 'name' }).select();
    if (!tagsData) return;

    const tagMap = new Map(tagsData.map(t => [t.name, t.id]));
    const relationsToUpsert = tags.map(name => ({
        anime_id: animeId,
        tag_id: tagMap.get(name)
    })).filter(r => r.tag_id);

    if (relationsToUpsert.length > 0) {
        await supabaseClient.from('anime_tags').upsert(relationsToUpsert, { onConflict: 'anime_id,tag_id' });
    }
}


export async function POST(request: Request) {
    // ... (начало функции POST остается тем же)
    
    // В цикле for (const anime of uniqueAnimeList)
    // ...
    // после вызова processAllRelations добавьте:
    // await processTags(supabase, animeIdMap.get(anime.shikimori_id), anime.material_data?.mydramalist_tags);
    
    // Полный код для POST для избежания ошибок
  const KODIK_TOKEN = process.env.KODIK_API_TOKEN;
  if (!KODIK_TOKEN) {
    return NextResponse.json({ error: "KODIK_API_TOKEN не настроен" }, { status: 500 });
  }

  try {
    const { nextPageUrl } = await request.json();
    const baseUrl = "https://kodikapi.com";
    let targetUrl: URL;

    if (nextPageUrl) {
      targetUrl = new URL(nextPageUrl, baseUrl);
    } else {
      targetUrl = new URL("/list", baseUrl);
      targetUrl.searchParams.set("token", KODIK_TOKEN);
      targetUrl.searchParams.set("types", "anime,anime-serial");
      targetUrl.searchParams.set("with_material_data", "true");
      targetUrl.searchParams.set("limit", "100");
    }

    const response = await fetch(targetUrl);
    if (!response.ok) throw new Error(`Ошибка от API Kodik: ${response.status}`);

    const data = await response.json();
    const animeList: KodikAnimeData[] = data.results || [];
    if (animeList.length === 0) {
      return NextResponse.json({ message: `Страница пуста.`, processed: 0, nextPageUrl: data.next_page || null });
    }

    const uniqueAnimeMap = new Map<string, KodikAnimeData>();
    for (const anime of animeList) {
        if (anime.shikimori_id && !uniqueAnimeMap.has(anime.shikimori_id)) {
            uniqueAnimeMap.set(anime.shikimori_id, anime);
        }
    }
    const uniqueAnimeList = Array.from(uniqueAnimeMap.values());

    if (uniqueAnimeList.length === 0) {
      return NextResponse.json({ message: `На странице не найдено записей с shikimori_id.`, processed: 0, nextPageUrl: data.next_page || null });
    }
    
    const animeRecordsToUpsert = uniqueAnimeList.map(anime => {
        const material = anime.material_data || {};
        return {
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
    });

    const { data: upsertedAnimes, error: animeError } = await supabase
      .from('animes')
      .upsert(animeRecordsToUpsert, { onConflict: 'shikimori_id' })
      .select('id, shikimori_id');

    if (animeError) throw animeError;

    const animeIdMap = new Map(upsertedAnimes!.map(a => [a.shikimori_id, a.id]));

    const translationRecordsToUpsert = animeList.map(anime => {
        const anime_id = animeIdMap.get(anime.shikimori_id!);
        if (!anime_id) return null;
        return {
            anime_id: anime_id,
            kodik_id: anime.id,
            title: anime.translation.title,
            type: anime.translation.type,
            quality: anime.quality,
            player_link: anime.link,
        };
    }).filter(Boolean);

    if (translationRecordsToUpsert.length > 0) {
        await supabase.from('translations').upsert(translationRecordsToUpsert, { onConflict: 'kodik_id' });
    }
    
    const relationsToProcess = uniqueAnimeList.map(anime => ({
        shikimori_id: anime.shikimori_id,
        genres: anime.material_data?.anime_genres,
        studios: anime.material_data?.anime_studios,
        countries: anime.material_data?.countries,
    }));
    await processAllRelations(supabase, relationsToProcess, animeIdMap);

    // Обрабатываем теги для каждого уникального аниме
    for (const anime of uniqueAnimeList) {
        const animeId = animeIdMap.get(anime.shikimori_id!);
        if (animeId) {
            await processTags(supabase, animeId, anime.material_data?.mydramalist_tags);
        }
    }
    
    return NextResponse.json({
      message: `Обработано. Сохранено/обновлено: ${upsertedAnimes!.length} записей.`,
      processed: upsertedAnimes!.length,
      nextPageUrl: data.next_page || null,
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : "Неизвестная ошибка";
    console.error("Parser Error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
