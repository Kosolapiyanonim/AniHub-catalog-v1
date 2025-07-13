// /lib/parser-utils.ts

import type { KodikAnimeData } from "@/lib/types";

// Новая функция для получения картинки-заглушки с Jikan API
async function getAlternativeImage(shikimoriId: string): Promise<string | null> {
  try {
    // Jikan API имеет ограничение на количество запросов, добавляем задержку
    await new Promise(resolve => setTimeout(resolve, 500)); 
    
    const response = await fetch(`https://api.jikan.moe/v4/anime/${shikimoriId}/pictures`);
    if (!response.ok) {
        console.warn(`Jikan Pictures API warning for ID ${shikimoriId}: Status ${response.status}`);
        return null;
    }
    
    const { data } = await response.json();
    // Берем первую картинку из галереи, если она есть
    return data?.[0]?.jpg?.large_image_url || null;
  } catch (error) {
    console.error(`Jikan Pictures API error for ID ${shikimoriId}:`, error);
    return null;
  }
}

// Трансформирует данные из Kodik в формат нашей таблицы 'animes'
export async function transformToAnimeRecord(anime: KodikAnimeData) {
    const material = anime.material_data || {};
    
    let finalPosterUrl: string | null = material.poster_url || anime.poster_url || null;
    let finalBackgroundImageUrl: string | null = null;
    
    // Если постер от Яндекса, сбрасываем его
    if (finalPosterUrl && finalPosterUrl.includes('yandex')) {
        finalPosterUrl = null;
    }

    // Если качественного постера нет, ищем альтернативное изображение
    if (!finalPosterUrl) {
        const alternativeImage = await getAlternativeImage(anime.shikimori_id!);
        if (alternativeImage) {
            // Если нашли альтернативу, используем ее как основной постер
            finalPosterUrl = alternativeImage;
        }
    }

    return {
        poster_url: finalPosterUrl,
        background_image_url: finalBackgroundImageUrl, // Это поле можно использовать в будущем для фона страницы аниме
        screenshots: anime.screenshots || [],
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
        mal_id: material.mal_id,
        mal_score: material.mal_score,
        mal_scored_by: material.mal_scored_by,
        mal_rank: material.mal_rank,
        mal_popularity: material.mal_popularity,
        mal_favorites: material.mal_favorites,
    };
}


// Обрабатывает все связи для одного аниме (жанры, студии, теги)
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
