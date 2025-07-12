// /lib/parser-utils.ts

import type { KodikAnimeData } from "@/lib/types";

// Трансформирует данные из Kodik в формат таблицы 'animes'
export function transformToAnimeRecord(anime: KodikAnimeData) {
    const material = anime.material_data || {};
    
    // Финальная, строгая логика выбора постера
    let finalPosterUrl: string | null = null;

    // 1. Приоритет №1: Постер с Shikimori
    if (material.poster_url && material.poster_url.includes('shikimori.one')) {
        finalPosterUrl = material.poster_url;
    } 
    // 2. Приоритет №2: Любой другой постер, если он НЕ с Яндекса
    else if (anime.poster_url && !anime.poster_url.includes('yandex')) {
        finalPosterUrl = anime.poster_url;
    }
    // 3. Приоритет №3: Первый скриншот как крайний случай
    else if (anime.screenshots && anime.screenshots.length > 0) {
        finalPosterUrl = anime.screenshots[0];
    }
    
    return {
        shikimori_id: anime.shikimori_id,
        poster_url: finalPosterUrl,
        title: material.anime_title || anime.title,
        title_orig: anime.title_orig,
        description: material.description || "Описание отсутствует.",
        year: anime.year,
        status: material.anime_status,
        type: anime.type,
        episodes_count: anime.episodes_count || material.episodes_total,
        shikimori_rating: material.shikimori_rating,
        shikimori_votes: material.shikimori_votes,
        rating_mpaa: material.rating_mpaa,
        raw_data: anime, // Сохраняем все сырые данные
        updated_at_kodik: anime.updated_at,
    };
}

// Обрабатывает все связи для одного аниме (жанры, студии, теги)
export async function processAllRelationsForAnime(supabase: any, anime: KodikAnimeData, animeId: number) {
    const material = anime.material_data || {};
    // Используем Promise.all для параллельной обработки
    await Promise.all([
        processRelation(supabase, 'genre', 'genres', animeId, material.genres || []),
        processRelation(supabase, 'studio', 'studios', animeId, material.studios || []),
        // Добавляем обработку тегов на будущее
        // processRelation(supabase, 'tag', 'tags', animeId, material.mydramalist_tags || []),
    ]);
}

// Внутренняя функция для обработки одного типа связей (жанр, студия, и т.д.)
async function processRelation(supabase: any, entityName: string, entityPluralName: string, animeId: number, entityValues: string[]) {
    if (!entityValues || entityValues.length === 0) return;

    const validValues = entityValues.filter(name => name && name.trim() !== "");
    if (validValues.length === 0) return;

    const { data: existingEntities } = await supabase.from(entityPluralName).select('id, name').in('name', validValues);
    const existingMap = new Map((existingEntities || []).map((e: any) => [e.name, e.id]));
    
    const newEntitiesToCreate = validValues
      .filter(name => !existingMap.has(name))
      .map(name => ({
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9а-яё]+/gi, '-').replace(/^-+|-+$/g, '') || name
    }));

    if (newEntitiesToCreate.length > 0) {
        const { data } = await supabase.from(entityPluralName).insert(newEntitiesToCreate).select('id, name');
        if (data) {
            data.forEach((e: any) => existingMap.set(e.name, e.id));
        }
    }

    const relationRecords = validValues
        .map(name => {
            const entityId = existingMap.get(name);
            if (!entityId) return null;
            return {
                anime_id: animeId,
                [`${entityName}_id`]: entityId
            };
        })
        .filter(Boolean);

    if (relationRecords.length > 0) {
        await supabase.from(`anime_${entityPluralName}`).upsert(relationRecords);
    }
}
