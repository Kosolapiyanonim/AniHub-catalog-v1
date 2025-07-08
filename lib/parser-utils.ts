// /lib/parser-utils.ts

import type { KodikAnimeData } from "@/lib/types";

// Обработка жанров, студий, стран и т.д.
async function processRelations(
    supabaseClient: any,
    items: { name: string }[] | undefined,
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
            return { anime_id: animeId, [idFieldName]: itemId };
        })
        .filter(Boolean);

    if (relationsToUpsert.length > 0) {
        await supabaseClient
            .from(relationTableName)
            .upsert(relationsToUpsert, { onConflict: `anime_id,${idFieldName}` });
    }
}

// Обработка тегов
export async function processTags(supabaseClient: any, animeId: number, tags: string[] | undefined) {
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

// Главная функция для обработки всех связей для одного аниме
export async function processAllRelationsForAnime(supabaseClient: any, anime: KodikAnimeData, animeId: number) {
    const material = anime.material_data || {};
    
    // Собираем все жанры в один массив
    const allGenres = new Set<string>();
    material.anime_genres?.forEach(g => allGenres.add(g));
    material.genres?.forEach(g => allGenres.add(g)); // Общие жанры
    material.drama_genres?.forEach(g => allGenres.add(g)); // Жанры дорам

    await processRelations(supabaseClient, Array.from(allGenres).map(name => ({ name })), 'genres', 'anime_genres', animeId, 'genre_id');
    await processRelations(supabaseClient, material.anime_studios?.map(name => ({ name })), 'studios', 'anime_studios', animeId, 'studio_id');
    await processRelations(supabaseClient, material.countries?.map(name => ({ name })), 'countries', 'anime_countries', animeId, 'country_id');
    await processTags(supabaseClient, animeId, material.mydramalist_tags);
}

// Функция для преобразования данных Kodik в запись для таблицы 'animes'
export function transformToAnimeRecord(anime: KodikAnimeData) {
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
}
