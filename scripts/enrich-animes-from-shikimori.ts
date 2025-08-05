// scripts/enrich-animes-from-shikimori.ts
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Загружаем переменные окружения из .env.local в самом начале
dotenv.config({ path: '.env.local' });

// Тип для ответа Shikimori API (минимальный, для наших нужд)
interface ShikimoriAnimeDetails {
  id: string;
  name: string;
  russian: string;
  description?: string | null; // Может быть null
  description_html?: string | null; // Альтернативное описание в HTML
  // coverImage включает разные размеры
  coverImage?: {
    // original - обычно самый большой
    original?: string;
    // preview - средний размер
    preview?: string;
  } | null;
  // Другие поля могут быть, но нам пока не нужны
  [key: string]: any;
}

// --- Настройки ---
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Проверка наличия критически важных переменных
if (!SUPABASE_URL) {
    console.error('[Setup] Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL must be set in .env.local');
    process.exit(1);
}
if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[Setup] Error: SUPABASE_SERVICE_ROLE_KEY must be set in .env.local');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const SHIKIMORI_API_BASE = 'https://shikimori.one/api';

/**
 * Получает подробную информацию об аниме с Shikimori по его shikimori_id.
 * @param shikimoriId ID аниме на Shikimori.
 * @returns Объект с данными или null в случае ошибки/неудачи.
 */
async function fetchAnimeDetailsFromShikimori(shikimoriId: string): Promise<ShikimoriAnimeDetails | null> {
  try {
    const url = `${SHIKIMORI_API_BASE}/animes/${shikimoriId}`;
    console.log(`[Shikimori Fetch] Fetching details for ID: ${shikimoriId} from ${url}`);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'AniHub/1.0 (https://your-website.com)',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`[Shikimori Fetch] 404 Not Found for ID ${shikimoriId}.`);
      } else {
        console.error(`[Shikimori Fetch] Error ${response.status} ${response.statusText} for ID ${shikimoriId}`);
      }
      return null;
    }

    const data: ShikimoriAnimeDetails = await response.json();
    return data;
  } catch (error) {
    console.error(`[Shikimori Fetch] Exception for ID ${shikimoriId}:`, error);
    return null;
  }
}

/**
 * Обогащает записи в таблице `animes` данными из Shikimori API.
 * Обновляет поля `description` и `background_image_url`, если они пусты в Supabase.
 * @param limit Максимальное количество записей для обработки за один запуск.
 */
export async function enrichAnimesFromShikimori(limit: number = 20) {
  try {
    console.log('--- Starting Shikimori Enrichment Process ---');

    // 1. Получаем записи из Supabase, у которых:
    //    - есть shikimori_id
    //    - description пустое ИЛИ background_image_url пустое
    const { data: animesToEnrich, error } = await supabase
      .from('animes')
      .select('id, shikimori_id, title, description, background_image_url')
      .not('shikimori_id', 'is', null)
      .not('shikimori_id', 'eq', '')
      .or('description.is.null,description.eq.,background_image_url.is.null,background_image_url.eq.')
      .limit(limit);

    if (error) {
      console.error('[Supabase Query] Error:', error);
      return;
    }

    if (!animesToEnrich || animesToEnrich.length === 0) {
      console.log('[Supabase Query] No animes need enrichment.');
      return;
    }

    console.log(`[Supabase Query] Found ${animesToEnrich.length} animes to enrich.`);

    let updatedCount = 0;

    for (const anime of animesToEnrich) {
      console.log(`\n--- Processing Anime ID: ${anime.id}, Shikimori ID: ${anime.shikimori_id}, Title: ${anime.title} ---`);

      const shikimoriData = await fetchAnimeDetailsFromShikimori(anime.shikimori_id);

      if (shikimoriData) {
        const updates: { description?: string | null; background_image_url?: string | null } = {};

        // Обновляем description
        if ((!anime.description || anime.description.trim() === '') && (shikimoriData.description || shikimoriData.description_html)) {
            let newDescription = shikimoriData.description;
            if (!newDescription && shikimoriData.description_html) {
                newDescription = shikimoriData.description_html.replace(/<[^>]*>?/gm, '');
            }
            if (newDescription) {
                updates.description = newDescription.trim();
                console.log(` -> Will update description from Shikimori.`);
            }
        }

        // Обновляем background_image_url
        if ((!anime.background_image_url || anime.background_image_url === '') && shikimoriData.coverImage) {
            const coverUrl = shikimoriData.coverImage.original || shikimoriData.coverImage.preview;
            if (coverUrl) {
                updates.background_image_url = coverUrl;
                console.log(` -> Will update background_image_url from Shikimori: ${coverUrl}`);
            }
        }

        // Обновляем запись в Supabase
        if (Object.keys(updates).length > 0) {
            const { error: updateError } = await supabase
              .from('animes')
              .update(updates)
              .eq('id', anime.id);

            if (updateError) {
              console.error(`[Supabase Update] Error for ID ${anime.id}:`, updateError);
            } else {
              console.log(`[Supabase Update] Successfully updated ID ${anime.id}.`);
              updatedCount++;
            }
        } else {
            console.log(` -> No suitable data found in Shikimori or fields already populated.`);
        }
      } else {
        console.log(` -> Failed to fetch data from Shikimori for ID ${anime.id}.`);
      }
    }

    console.log(`\n--- Enrichment Process Completed ---`);
    console.log(`Successfully updated ${updatedCount} animes.`);

  } catch (error) {
    console.error('[Main Process] Unexpected error:', error);
  }
}

// --- Для запуска как отдельного скрипта ---
if (typeof require !== 'undefined' && require.main === module) {
    console.log('[Script Start] Initiating enrichAnimesFromShikimori...');
    enrichAnimesFromShikimori(20).catch(console.error); // Можно изменить лимит
}
