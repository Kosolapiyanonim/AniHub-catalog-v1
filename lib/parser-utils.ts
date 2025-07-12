// /lib/parser-utils.ts

import { createClient } from "@supabase/supabase-js";
import type { KodikAnimeData } from "@/lib/types";

// Трансформирует данные из Kodik в формат таблицы 'animes'
export function transformToAnimeRecord(anime: KodikAnimeData) {
    const material = anime.material_data || {};
    return {
        // ИСПРАВЛЕНИЕ: Добавлена правильная логика выбора постера
        poster_url: material.poster_url || anime.poster_url,
        
        shikimori_id: anime.shikimori_id,
        title: material.anime_title || anime.title,
        title_orig: anime.title_orig,
        year: anime.year,
        description: material.description || "Описание отсутствует.",
        status: material.anime_status,
        type: anime.type,
        episodes_count: anime.episodes_count || material.episodes_total || 0,
        shikimori_rating: material.shikimori_rating,
        shikimori_votes: material.shikimori_votes,
        updated_at_kodik: anime.updated_at,
    };
}

// Обрабатывает все связи для одного аниме (жанры, студии)
export async function processAllRelationsForAnime(supabase: any, anime: KodikAnimeData, animeId: number) {
    const material = anime.material_data || {};
    // Убедимся, что используем правильные поля из material_data
    await processRelation(supabase, 'genre', 'genres', animeId, material.genres || []);
    await processRelation(supabase, 'studio', 'studios', animeId, material.studios || []);
}

// Внутренняя функция для обработки одного типа связей
async function processRelation(supabase: any, entityName: string, entityPluralName: string, animeId: number, entityValues: string[]) {
    if (!entityValues || entityValues.length === 0) return;

    const { data: existingEntities } = await supabase.from(entityPluralName).select('id, name').in('name', entityValues);
    const existingMap = new Map((existingEntities || []).map((e: any) => [e.name, e.id]));
    
    const newEntitiesToCreate = entityValues.filter(name => !existingMap.has(name)).map(name => ({
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9а-яё]+/gi, '-').replace(/^-+|-+$/g, '') || name
    }));

    if (newEntitiesToCreate.length > 0) {
        const { data } = await supabase.from(entityPluralName).insert(newEntitiesToCreate).select('id, name');
        if (data) {
            data.forEach((e: any) => existingMap.set(e.name, e.id));
        }
    }

    const relationRecords = entityValues.map(name => ({
        anime_id: animeId,
        [`${entityName}_id`]: existingMap.get(name)
    })).filter(r => r[`${entityName}_id`]);

    if (relationRecords.length > 0) {
        await supabase.from(`anime_${entityPluralName}`).upsert(relationRecords, { onConflict: `anime_id,${entityName}_id` });
    }
}
