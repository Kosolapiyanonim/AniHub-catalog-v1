// Замените содержимое файла: /app/api/parse-single-page/route.ts

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { KodikAnimeData } from "@/lib/types";

// ... (вспомогательная функция processRelations остается без изменений)
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
    } catch (error) {}
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
    if (!response.ok) throw new Error(`Ошибка от API Kodik: ${response.status}`);

    const data = await response.json();
    const animeList: KodikAnimeData[] = data.results || [];
    if (animeList.length === 0) {
      return NextResponse.json({ message: `Страница пуста.`, processed: 0, nextPageUrl: data.next_page || null });
    }

    // --- ОПТИМИЗАЦИЯ ---
    const animeRecordsToUpsert: any[] = [];
    const relationsToProcess: any[] = [];
    const translationsToUpsertMap = new Map();

    for (const anime of animeList) {
      if (!anime.shikimori_id) continue;
      const material = anime.material_data || {};
      
      animeRecordsToUpsert.push({
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
      });

      translationsToUpsertMap.set(anime.shikimori_id, {
          kodik_id: anime.id,
          title: anime.translation.title,
          type: anime.translation.type,
          quality: anime.quality,
          player_link: anime.link,
      });

      relationsToProcess.push({
          shikimori_id: anime.shikimori_id,
          genres: material.anime_genres,
          studios: material.anime_studios,
          countries: material.countries,
      });
    }

    // 1. Пакетно сохраняем основную информацию об аниме
    const { data: upsertedAnimes, error: animeError } = await supabase
      .from('animes')
      .upsert(animeRecordsToUpsert, { onConflict: 'shikimori_id' })
      .select('id, shikimori_id');

    if (animeError) throw animeError;

    // 2. Пакетно сохраняем озвучки
    const translationRecords = upsertedAnimes!.map(anime => ({
        anime_id: anime.id,
        ...translationsToUpsertMap.get(anime.shikimori_id),
    }));

    const { error: translationError } = await supabase
      .from('translations')
      .upsert(translationRecords, { onConflict: 'kodik_id' });

    if (translationError) throw translationError;

    // 3. Обрабатываем связи (этот шаг оставляем в цикле, т.к. он сложнее для пакетирования)
    const animeIdMap = new Map(upsertedAnimes!.map(a => [a.shikimori_id, a.id]));
    for (const rel of relationsToProcess) {
        const animeId = animeIdMap.get(rel.shikimori_id);
        if (animeId) {
            await processRelations(supabase, animeId, rel.genres, 'genre');
            await processRelations(supabase, animeId, rel.studios, 'studio');
            await processRelations(supabase, animeId, rel.countries, 'country');
        }
    }
    
    return NextResponse.json({
      message: `Обработано. Сохранено/обновлено: ${upsertedAnimes!.length} записей.`,
      processed: upsertedAnimes!.length,
      nextPageUrl: data.next_page || null,
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : "Неизвестная ошибка";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
