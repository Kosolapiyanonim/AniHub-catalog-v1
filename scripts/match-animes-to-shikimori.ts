// scripts/match-animes-to-shikimori.ts
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv'; // Импортируем dotenv

// Загружаем переменные окружения из .env.local в самом начале
// Это критично для автономного запуска скрипта
dotenv.config({ path: '.env.local' });

// Тип для результата поиска Shikimori API (минимальный)
interface ShikimoriSearchResult {
  id: string;         // Это и есть shikimori_id
  name: string;       // Оригинальное название
  russian: string;    // Название на русском
  year?: number;      // Год выхода (может отсутствовать)
  // Другие поля могут быть, но нам пока не нужны
  [key: string]: any;
}

// --- Настройки ---
// Явно получаем переменные из process.env после загрузки dotenv
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

// Создаем клиент Supabase только после проверки переменных
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const SHIKIMORI_API_BASE = 'https://shikimori.one/api';

/**
 * Ищет аниме на Shikimori по названию.
 * @param title Название аниме для поиска.
 * @returns Первый результат поиска или null, если ничего не найдено.
 */
async function searchAnimeOnShikimori(title: string): Promise<ShikimoriSearchResult | null> {
  try {
    // Кодируем название для URL
    const encodedTitle = encodeURIComponent(title);
    // Формируем URL для поиска. Используем limit=1 для получения самого релевантного результата.
    // Документация: https://shikimori.one/api/doc/2.0/animes#index
    const url = `${SHIKIMORI_API_BASE}/animes?search=${encodedTitle}&limit=1&order=ranked`;
    
    console.log(`[Shikimori Search] Searching for: "${title}" at ${url}`);

    const response = await fetch(url, {
      headers: {
        // Очень важно указывать User-Agent!
        'User-Agent': 'AniHub/1.0 (https://your-website.com)', // TODO: Замени на свой домен или имя проекта
      },
    });

    if (!response.ok) {
      console.error(`[Shikimori Search] Error ${response.status}: ${response.statusText} for query "${title}"`);
      // Не останавливаем весь процесс из-за ошибки одного запроса
      return null;
    }

    const results: ShikimoriSearchResult[] = await response.json();

    if (results && results.length > 0) {
      const bestMatch = results[0];
      console.log(`[Shikimori Search] Found match: ID ${bestMatch.id}, Name: ${bestMatch.name}, Russian: ${bestMatch.russian}`);
      return bestMatch;
    } else {
      console.log(`[Shikimori Search] No matches found for "${title}"`);
      return null;
    }
  } catch (error) {
    console.error(`[Shikimori Search] Exception while searching for "${title}":`, error);
    return null;
  }
}

/**
 * Сопоставляет аниме из Supabase с Shikimori по названию и записывает shikimori_id.
 * @param limit Максимальное количество записей для обработки за один запуск.
 */
export async function matchAnimesToShikimori(limit: number = 20) {
  try {
    console.log('--- Starting Shikimori Matching Process ---');
    console.log(`[Setup] Using Supabase URL: ${SUPABASE_URL?.substring(0, 30)}...`); // Логируем часть URL для проверки

    // 1. Получаем записи из Supabase, у которых shikimori_id отсутствует или пустой
    const { data: animesToMatch, error } = await supabase
      .from('animes')
      .select('id, title, title_orig, shikimori_id') // Выбираем нужные поля
      .or('shikimori_id.is.null,shikimori_id.eq.') // shikimori_id NULL или пустая строка
      .limit(limit); // Ограничиваем количество для теста

    if (error) {
      console.error('[Supabase Query] Error fetching animes to match:', error);
      return;
    }

    if (!animesToMatch || animesToMatch.length === 0) {
      console.log('[Supabase Query] No animes found that need matching (shikimori_id is empty).');
      return;
    }

    console.log(`[Supabase Query] Found ${animesToMatch.length} animes to process.`);

    let matchedCount = 0;
    let notFoundCount = 0;
    let errorCount = 0;

    // 2. Обрабатываем каждую запись
    for (const anime of animesToMatch) {
      console.log(`\n--- Processing Anime ID: ${anime.id}, Title: ${anime.title} ---`);

      // Определяем название для поиска. Приоритет оригинальному названию.
      const searchTitle = anime.title_orig?.trim() || anime.title?.trim();

      if (!searchTitle) {
        console.warn(`[Processing] Skipping anime ID ${anime.id} because both title and title_orig are empty.`);
        notFoundCount++;
        continue;
      }

      console.log(`[Processing] Using search title: "${searchTitle}"`);

      // 3. Поиск на Shikimori
      const shikimoriMatch = await searchAnimeOnShikimori(searchTitle);

      if (shikimoriMatch) {
        // 4. Если найдено совпадение, обновляем запись в Supabase
        const { error: updateError } = await supabase
          .from('animes')
          .update({ shikimori_id: shikimoriMatch.id }) // Обновляем только shikimori_id
          .eq('id', anime.id); // По ID записи в нашей БД

        if (updateError) {
          console.error(`[Supabase Update] Error updating anime ID ${anime.id}:`, updateError);
          errorCount++;
        } else {
          console.log(`[Supabase Update] Successfully set shikimori_id to ${shikimoriMatch.id} for anime ID ${anime.id}`);
          matchedCount++;
        }
      } else {
        console.log(`[Processing] No match found on Shikimori for "${searchTitle}".`);
        notFoundCount++;
        // Опционально: можно записать флаг, что попытка была, например, в отдельное поле или лог.
      }
    }

    console.log('\n--- Matching Process Completed ---');
    console.log(`Summary: Matched ${matchedCount}, Not Found ${notFoundCount}, Errors ${errorCount}`);

  } catch (error) {
    console.error('[Main Process] Unexpected error during matching process:', error);
  }
}

// --- Для запуска как отдельного скрипта ---
// Проверка `require.main === module` не всегда работает с `tsx`, но оставим для совместимости
if (typeof require !== 'undefined' && require.main === module) {
    // Запускаем функцию с лимитом 5 для начала
    console.log('[Script Start] Initiating matchAnimesToShikimori with limit 5...');
    matchAnimesToShikimori(5).catch(console.error);
}

// --- Для импорта в другие файлы ---
// export { matchAnimesToShikimori };
