// Замените содержимое файла: /app/api/parse-single-page/route.ts

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { KodikAnimeData } from "@/lib/types";

// ... (вспомогательная функция processAllRelations остается без изменений)
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
    const { nextPageUrl } = await request.json();
    
    // **ИСПРАВЛЕНИЕ:** Переписана логика формирования URL для надежности
    const baseDomain = "https://kodikapi.com";
    let requestUrl: string;

    if (nextPageUrl) {
      // Если есть ссылка на следующую страницу, используем ее
      requestUrl = `${baseDomain}${nextPageUrl}`;
    } else {
      // Для самого первого запроса формируем URL с параметрами
      const params = new URLSearchParams({
        token: KODIK_TOKEN,
        types: 'anime,anime-serial',
        with_material_data: 'true',
        limit: '100'
      });
      requestUrl = `${baseDomain}/list?${params.toString()}`;
    }

    const response = await fetch(requestUrl);
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
