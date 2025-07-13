// /lib/parser-utils.ts

import type { KodikAnimeData } from "@/lib/types";

// Новая функция для получения данных с Jikan API (MyAnimeList)
async function getMalData(shikimoriId: string) {
  try {
    // Jikan API использует тот же ID, что и Shikimori
    console.log(`[Jikan] Запрос для shikimori_id: ${shikimoriId}`);
    const response = await fetch(`https://api.jikan.moe/v4/anime/${shikimoriId}`);
    // Jikan API имеет ограничение на количество запросов, добавляем задержку
    await new Promise(resolve => setTimeout(resolve, 500)); // Задержка 0.5 секунды
    
    if (!response.ok) return null;
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error(`[Jikan] Ошибка для ID ${shikimoriId}:`, error);
    return null;
  }
}

// Теперь эта функция асинхронная, так как она ждет ответа от Jikan
export async function transformToAnimeRecord(anime: KodikAnimeData) {
    const material = anime.material_data || {};
    
    // Получаем дополнительные данные с MAL
    const malData = await getMalData(anime.shikimori_id!);

    // Логика выбора лучшего постера
    let finalPosterUrl: string | null = malData?.images?.jpg?.large_image_url || material.poster_url || anime.poster_url;
    if (finalPosterUrl && finalPosterUrl.includes('yandex')) {
        finalPosterUrl = null;
    }

    return {
        // Данные из MAL (если они есть)
        mal_id: malData?.mal_id,
        mal_score: malData?.score,
        mal_scored_by: malData?.scored_by,
        mal_rank: malData?.rank,
        mal_popularity: malData?.popularity,
        mal_favorites: malData?.favorites,

        // Основные данные (Kodik как источник, MAL как возможное дополнение)
        poster_url: finalPosterUrl,
        shikimori_id: anime.shikimori_id,
        title: malData?.title || material.anime_title || anime.title,
        title_orig: malData?.title_japanese || anime.title_orig,
        description: malData?.synopsis || material.description || "Описание отсутствует.",
        year: anime.year,
        status: malData?.status || material.anime_status,
        type: malData?.type || anime.type,
        episodes_count: anime.episodes_count || material.episodes_total,
        shikimori_rating: material.shikimori_rating,
        shikimori_votes: material.shikimori_votes,
        updated_at_kodik: anime.updated_at,
        raw_data: { kodik: anime, mal: malData }, // Сохраняем оба сырых ответа
    };
}

// ... (остальные функции processAllRelationsForAnime и processRelation остаются БЕЗ ИЗМЕНЕНИЙ)
export async function processAllRelationsForAnime(supabase: any, anime: KodikAnimeData, animeId: number) {
    // ...
}
async function processRelation(supabase: any, entityName: string, entityPluralName: string, animeId: number, entityValues: string[]) {
    // ...
}
