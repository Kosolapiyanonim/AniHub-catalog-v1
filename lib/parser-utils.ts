// /lib/parser-utils.ts

import type { KodikAnimeData } from "@/lib/types";

// Хелпер для проверки, является ли URL ссылкой на Shikimori
const isShikimoriUrl = (url: string | null | undefined): boolean => {
    if (!url) return false;
    return url.includes('shikimori.one') || url.includes('dere.shikimori.one') || url.includes('nyaa.shikimori.one');
};

// Трансформирует данные из Kodik в формат таблицы 'animes'
export function transformToAnimeRecord(anime: KodikAnimeData) {
    const material = anime.material_data || {};
    
    let finalPosterUrl: string | null = null;

    // --- ФИНАЛЬНАЯ ЛОГИКА ВЫБОРА ПОСТЕРА (БЕЗ СКРИНШОТОВ) ---
    const materialPoster = material.poster_url;
    const rootPoster = anime.poster_url;

    // 1. Приоритет №1: Постер с Shikimori
    if (isShikimoriUrl(materialPoster)) {
        finalPosterUrl = materialPoster;
    } else if (isShikimoriUrl(rootPoster)) {
        finalPosterUrl = rootPoster;
    }
    // 2. Приоритет №2: Любой другой постер (кроме Яндекса)
    else if (materialPoster && !materialPoster.includes('yandex')) {
        finalPosterUrl = materialPoster;
    } else if (rootPoster && !rootPoster.includes('yandex')) {
        finalPosterUrl = rootPoster;
    }
    // 3. Приоритет №3: Яндекс как крайний случай
    else if (materialPoster || rootPoster) {
        finalPosterUrl = materialPoster || rootPoster;
    }
    // Если ничего не подошло, finalPosterUrl останется null

    return {
        poster_url: finalPosterUrl,
        screenshots: anime.screenshots || [], // По-прежнему сохраняем скриншоты в их собственное поле
        
        shikimori_id: anime.shikimori_id,
        title: material.anime_title || anime.title,
        title_orig: anime.title_orig,
        year: anime.year,
        description: material.description || "Описание отсутствует.",
        status: material.anime_status,
        type: anime.type,
        episodes_total: anime.episodes_total || anime.episodes_count || 0,
        episodes_aired: anime.last_episode || 0,
        shikimori_rating: material.shikimori_rating,
        shikimori_votes: material.shikimori_votes,
        rating_mpaa: material.rating_mpaa,
        updated_at_kodik: anime.updated_at,
        raw_data: anime,
    };
}

// Обрабатывает все связи для одного аниме
export async function processAllRelationsForAnime(supabase: any, anime: KodikAnimeData, animeId: number) {
    const material = anime.material_data || {};
    await Promise.all([
        processRelation(supabase, 'genre', 'genres', animeId, material.genres || []),
        processRelation(supabase, 'studio', 'studios', animeId, material.studios || []),
        processRelation(supabase, 'tag', 'tags', animeId, material.mydramalist_tags || []),
    ]);
}

// Внутренняя функция для обработки одного типа связей
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
