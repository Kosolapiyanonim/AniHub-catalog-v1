// scripts/enrich-animes-from-shikimori-graphql.ts
import { createClient } from '@supabase/supabase-js';
import { GraphQLClient } from 'graphql-request'; // Импортируем только GraphQLClient
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// --- Настройки ---
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
// ИСПРАВЛЕНО: Убраны лишние пробелы
const SHIKIMORI_GRAPHQL_ENDPOINT = 'https://shikimori.one/api/graphql';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[Setup] Error: Supabase URL and Service Role Key must be set in .env.local');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const graphqlClient = new GraphQLClient(SHIKIMORI_GRAPHQL_ENDPOINT, {
    headers: {
        // ИСПРАВЛЕНО: Убраны лишние пробелы
        'User-Agent': 'AniHub/1.0 (https://your-website.com)',
    },
});

// --- GraphQL Запрос ---
// Запрашиваем и poster, и screenshots
const GET_ANIME_IMAGES = `
  query ($ids: String!) {
    animes(ids: $ids) {
      id
      poster {
        originalUrl
        previewUrl
      }
      screenshots {
        originalUrl
        x332Url
      }
    }
  }
`;

/**
 * Получает poster и скриншоты для массива аниме по их shikimori_id через GraphQL.
 * @param shikimoriIds Массив shikimori_id.
 * @returns Map<shikimori_id, { posterUrl: string | null, screenshotUrl: string | null }>
 */
async function fetchAnimeImages(shikimoriIds: string[]): Promise<Map<string, { posterUrl: string | null, screenshotUrl: string | null }>> {
    try {
        const idsString = shikimoriIds.join(',');
        console.log(`[GraphQL] Fetching images for ${shikimoriIds.length} animes (IDs: ${idsString.substring(0, 50)}...)...`);
        
        // Выполняем запрос
        const response = await graphqlClient.request(GET_ANIME_IMAGES, { ids: idsString });
        console.log(`[DEBUG] Raw GraphQL response type for IDs ${idsString}: ${typeof response}`); // Отладка
        // console.log(`[DEBUG] Raw GraphQL response for IDs ${idsString}:`, JSON.stringify(response, null, 2)); // Более подробная отладка

        // --- ДОБАВЛЕНО: Проверка, что response не undefined и является объектом ---
        if (!response || typeof response !== 'object') {
            console.error(`[GraphQL] Invalid or undefined response received for IDs ${idsString}. Response:`, response);
            return new Map();
        }
        // Извлекаем data из response. graphql-request может возвращать { data, errors } или сразу data.
        const data = response.data !== undefined ? response.data : response;
        // --- КОНЕЦ ДОБАВЛЕНИЯ ---

        const imagesMap = new Map<string, { posterUrl: string | null, screenshotUrl: string | null }>();
        
        // --- ИЗМЕНЕНО: Проверка data.animes ---
        if (data?.animes && Array.isArray(data.animes)) {
            for (const anime of data.animes) {
                if (anime?.id) { // Дополнительная проверка на существование anime и id
                    const posterUrl = anime.poster?.originalUrl || anime.poster?.previewUrl || null;
                    // Берем первый скриншот, если есть
                    const screenshotUrl = anime.screenshots?.[0]?.originalUrl || anime.screenshots?.[0]?.x332Url || null;
                    imagesMap.set(anime.id, { posterUrl, screenshotUrl });
                    // --- ДОБАВЛЕНО: Отладка для отдельных аниме ---
                    // console.log(`[DEBUG] Processed anime ID ${anime.id}: poster=${posterUrl ? 'YES' : 'NO'}, screenshot=${screenshotUrl ? 'YES' : 'NO'}`);
                    // --- КОНЕЦ ДОБАВЛЕНИЯ ---
                } else {
                    console.warn(`[GraphQL] Skipping anime in response, missing 'id':`, anime);
                }
            }
        } else {
            console.warn(`[GraphQL] 'data.animes' is missing, null, or not an array in response for IDs ${idsString}.`);
            // Для отладки можно залогировать часть data
            console.log(`[DEBUG] 'data' object keys (if any):`, data ? Object.keys(data) : 'data is null/undefined');
        }
        // --- КОНЕЦ ИЗМЕНЕНИЯ ---

        console.log(`[GraphQL] Successfully fetched images for ${imagesMap.size} animes.`);
        return imagesMap;
    } catch (error: any) {
        // Улучшенная обработка ошибок
        let errorMessage = 'Unknown error';
        if (error && typeof error === 'object') {
            if (error.message) {
                errorMessage = error.message;
            } else {
                errorMessage = JSON.stringify(error);
            }
            // Проверяем наличие GraphQL-специфичных полей
            if (error.response?.errors) {
                errorMessage = `GraphQL Errors: ${JSON.stringify(error.response.errors)}`;
            }
        } else if (typeof error === 'string') {
            errorMessage = error;
        }
        console.error(`[GraphQL] Error fetching images:`, errorMessage);
        return new Map();
    }
}

/**
 * Обогащает записи в таблице `animes` данными из Shikimori GraphQL API.
 * Обновляет поля `poster_url` и `background_image_url`, если они пусты.
 * @param batchSize Размер пакета для запросов к GraphQL.
 * @param limit Максимальное количество записей для обработки за один запуск.
 */
export async function enrichAnimesFromShikimoriGraphQL(batchSize: number = 30, limit: number = 100) {
    try {
        console.log('--- Starting Shikimori GraphQL Enrichment Process ---');

        const { data: animesToEnrich, error } = await supabase
            .from('animes')
            .select('id, shikimori_id, title, poster_url, background_image_url')
            .not('shikimori_id', 'is', null)
            .not('shikimori_id', 'eq', '')
            .or('poster_url.is.null,poster_url.eq.,background_image_url.is.null,background_image_url.eq.')
            .limit(limit);

        if (error) {
            console.error('[Supabase Query] Error:', error);
            return;
        }

        if (!animesToEnrich || animesToEnrich.length === 0) {
            console.log('[Supabase Query] No animes need enrichment for poster_url or background_image_url.');
            return;
        }

        console.log(`[Supabase Query] Found ${animesToEnrich.length} animes to enrich.`);

        let updatedCount = 0;
        let errorCount = 0;

        for (let i = 0; i < animesToEnrich.length; i += batchSize) {
            const batch = animesToEnrich.slice(i, i + batchSize);
            console.log(`\n--- Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(animesToEnrich.length / batchSize)} (${batch.length} animes) ---`);

            const shikimoriIds = batch.map(a => a.shikimori_id).filter(Boolean) as string[];
            
            if (shikimoriIds.length === 0) {
                console.log(`[Batch] Skipping batch, no valid shikimori_ids.`);
                continue;
            }

            const imagesMap = await fetchAnimeImages(shikimoriIds);

            for (const anime of batch) {
                const images = imagesMap.get(anime.shikimori_id);
                
                if (images) {
                    const updates: { poster_url?: string; background_image_url?: string } = {};

                    if ((!anime.poster_url || anime.poster_url === '') && images.posterUrl) {
                        updates.poster_url = images.posterUrl;
                    }

                    if ((!anime.background_image_url || anime.background_image_url === '') && images.screenshotUrl) {
                        updates.background_image_url = images.screenshotUrl;
                    }

                    if (Object.keys(updates).length > 0) {
                        const { error: updateError } = await supabase
                            .from('animes')
                            .update(updates)
                            .eq('id', anime.id);

                        if (updateError) {
                            console.error(`[Supabase Update] Error for anime ID ${anime.id}:`, updateError);
                            errorCount++;
                        } else {
                            console.log(`[Supabase Update] Successfully updated images for anime ID ${anime.id}:`, updates);
                            updatedCount++;
                        }
                    } else {
                         console.log(`[Batch] No image updates needed for anime ID ${anime.id}.`);
                    }
                } else {
                    console.log(`[Batch] No images found for anime ID ${anime.id} (Shikimori ID: ${anime.shikimori_id})`);
                }
            }
        }

        console.log(`\n--- GraphQL Enrichment Process Completed ---`);
        console.log(`Successfully updated ${updatedCount} animes. Errors: ${errorCount}.`);

    } catch (error) {
        console.error('[Main Process] Unexpected error:', error);
    }
}

// --- Для запуска как отдельного скрипта ---
if (typeof require !== 'undefined' && require.main === module) {
    console.log('[Script Start] Initiating enrichAnimesFromShikimoriGraphQL...');
    enrichAnimesFromShikimoriGraphQL(30, 1000).catch(console.error); // Лимит 100 для теста
}
