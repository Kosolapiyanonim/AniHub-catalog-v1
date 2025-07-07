// Замените содержимое файла: /app/api/parse-latest/route.ts

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { KodikAnimeData } from "@/lib/types";

// Новая, пакетная функция для обработки связей
async function processAllRelations(supabaseClient: any, relationsToProcess: any[], animeIdMap: Map<string, number>) {
    const allGenres = new Set<string>();
    const allStudios = new Set<string>();
    const allCountries = new Set<string>();

    relationsToProcess.forEach(rel => {
        rel.genres?.forEach((g: string) => allGenres.add(g));
        rel.studios?.forEach((s: string) => allStudios.add(s));
        rel.countries?.forEach((c: string) => allCountries.add(c));
    });

    const { data: genresData } = await supabaseClient.from('genres').upsert(Array.from(allGenres).map(name => ({ name })), { onConflict: 'name' }).select();
    const { data: studiosData } = await supabaseClient.from('studios').upsert(Array.from(allStudios).map(name => ({ name })), { onConflict: 'name' }).select();
    const { data: countriesData } = await supabaseClient.from('countries').upsert(Array.from(allCountries).map(name => ({ name })), { onConflict: 'name' }).select();

    const genreMap = new Map(genresData?.map(g => [g.name, g.id]));
    const studioMap = new Map(studiosData?.map(s => [s.name, s.id]));
    const countryMap = new Map(countriesData?.map(c => [c.name, c.id]));
    
    const relationsToUpsert: any[] = [];
    relationsToProcess.forEach(rel => {
        const animeId = animeIdMap.get(rel.shikimori_id);
        if (!animeId) return;

        rel.genres?.forEach((name: string) => relationsToUpsert.push({ anime_id: animeId, relation_id: genreMap.get(name), relation_type: 'genre' }));
        rel.studios?.forEach((name: string) => relationsToUpsert.push({ anime_id: animeId, relation_id: studioMap.get(name), relation_type: 'studio' }));
        rel.countries?.forEach((name: string) => relationsToUpsert.push({ anime_id: animeId, relation_id: countryMap.get(name), relation_type: 'country' }));
    });

    if (relationsToUpsert.length > 0) {
        await supabaseClient.from('anime_relations').upsert(relationsToUpsert.filter(r => r.relation_id), { onConflict: 'anime_id,relation_id,relation_type' });
    }
}


export async function POST(request: Request) {
  const KODIK_TOKEN = process.env.KODIK_API_TOKEN;
  if (!KODIK_TOKEN) {
    return NextResponse.json({ error: "KODIK_API_TOKEN не настроен" }, { status: 500 });
  }

  try {
    const requestUrl = `https://kodikapi.com/list?token=${KODIK_TOKEN}&types=anime,anime-serial&with_material_data=true&limit=100&sort=updated_at&order=desc`;

    const response = await fetch(requestUrl);
    if (!response.ok) throw new Error(`Ошибка от API Kodik: ${response.status}`);
    
    const data = await response.json();
    const animeList: KodikAnimeData[] = data.results || [];

    if (animeList.length === 0) {
      return NextResponse.json({ message: `Новых обновлений не найдено.`, processed: 0 });
    }

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

    const { data: upsertedAnimes, error: animeError } = await supabase
      .from('animes')
      .upsert(animeRecordsToUpsert, { onConflict: 'shikimori_id' })
      .select('id, shikimori_id');

    if (animeError) throw animeError;

    const translationRecords = upsertedAnimes!.map(anime => ({
        anime_id: anime.id,
        ...translationsToUpsertMap.get(anime.shikimori_id),
    }));

    await supabase.from('translations').upsert(translationRecords, { onConflict: 'kodik_id' });
    
    const animeIdMap = new Map(upsertedAnimes!.map(a => [a.shikimori_id, a.id]));
    await processAllRelations(supabase, relationsToProcess, animeIdMap);

    return NextResponse.json({
      message: `Последние обновления обработаны. Найдено и сохранено: ${upsertedAnimes!.length} записей.`,
      processed: upsertedAnimes!.length,
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : "Неизвестная ошибка";
    console.error("Latest Parser Error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
