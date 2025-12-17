// /app/api/parse-single-page/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { KodikAnimeData } from "@/lib/types";
import { transformToAnimeRecord, processAllRelationsForAnime } from "@/lib/parser-utils";

export const dynamic = 'force-dynamic';

// Улучшенная функция логирования
const createLogger = () => {
  const logs: string[] = [];
  const startTime = Date.now();
  
  const log = (message: string, level: 'info' | 'warn' | 'error' | 'success' = 'info') => {
    const timestamp = new Date().toISOString();
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    const emoji = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : level === 'success' ? '✅' : 'ℹ️';
    const logMessage = `[${timestamp}] [${elapsed}s] ${emoji} ${message}`;
    
    console.log(logMessage);
    logs.push(logMessage);
  };
  
  return { log, logs, getElapsed: () => ((Date.now() - startTime) / 1000).toFixed(2) };
};

export async function GET(request: Request) {
  return NextResponse.json({
    status: 'ok',
    message: 'Parser API is online. Use POST method to parse.',
    endpoint: '/api/parse-single-page',
    method: 'POST',
    example: {
      curl: 'curl -X POST http://localhost:3008/api/parse-single-page -H "Content-Type: application/json" -d "{}"',
      body: '{} or {"nextPageUrl": "..."}'
    }
  });
}

export async function POST(request: Request) {
    const logger = createLogger();
    
    try {
        logger.log('🚀 Запуск парсера одной страницы...', 'info');
        
        // Проверка переменных окружения
        const KODIK_TOKEN = process.env.KODIK_API_TOKEN;
        const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

        const missingVars = [];
        if (!KODIK_TOKEN) missingVars.push('KODIK_API_TOKEN');
        if (!SUPABASE_URL) missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
        if (!SUPABASE_SERVICE_KEY) missingVars.push('SUPABASE_SERVICE_ROLE_KEY');
        
        if (missingVars.length > 0) {
            throw new Error(`Отсутствуют переменные окружения: ${missingVars.join(', ')}`);
        }
        
        logger.log('✅ Переменные окружения проверены', 'success');
        
        // TypeScript знает, что переменные не undefined после проверки выше
        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!);
        
        const { nextPageUrl } = await request.json().catch(() => ({}));
        const baseUrl = "https://kodikapi.com";
        let targetUrl: URL;

        if (nextPageUrl) {
            targetUrl = new URL(nextPageUrl);
            logger.log(`📄 Используется nextPageUrl: ${targetUrl.pathname}${targetUrl.search.substring(0, 50)}...`, 'info');
        } else {
            targetUrl = new URL("/list", baseUrl);
            targetUrl.searchParams.set("token", KODIK_TOKEN!);
            targetUrl.searchParams.set("types", "anime,anime-serial");
            targetUrl.searchParams.set("with_material_data", "true");
            targetUrl.searchParams.set("limit", "100");
            logger.log('📄 Начинаем с первой страницы', 'info');
        }

        logger.log(`🌐 Запрос к Kodik API: ${targetUrl.pathname}...`, 'info');
        const fetchStart = Date.now();
        
        const response = await fetch(targetUrl);
        const fetchTime = ((Date.now() - fetchStart) / 1000).toFixed(2);
        
        if (!response.ok) {
            const errorBody = await response.text();
            logger.log(`❌ Kodik API вернул ошибку ${response.status} за ${fetchTime}s`, 'error');
            throw new Error(`Kodik API error ${response.status}: ${errorBody.substring(0, 200)}`);
        }
        
        logger.log(`✅ Ответ получен за ${fetchTime}s`, 'success');
        
        const data = await response.json();
        const totalFromKodik = data.results?.length || 0;
        const animeList: KodikAnimeData[] = (data.results || []).filter((anime: any) => anime.shikimori_id);
        const filteredCount = totalFromKodik - animeList.length;

        logger.log(`📊 Получено записей: ${totalFromKodik} (с shikimori_id: ${animeList.length}, отфильтровано: ${filteredCount})`, 'info');

        if (animeList.length === 0) {
            logger.log('⚠️ На странице нет аниме с shikimori_id', 'warn');
            return NextResponse.json({ 
                message: "На странице не найдено аниме с shikimori_id.", 
                processed: 0, 
                nextPageUrl: data.next_page || null,
                logs: logger.logs 
            });
        }

        // Дедупликация по shikimori_id
        const uniqueAnimeMap = new Map<string, KodikAnimeData>();
        animeList.forEach(anime => {
            if (anime.shikimori_id && !uniqueAnimeMap.has(anime.shikimori_id)) {
                uniqueAnimeMap.set(anime.shikimori_id, anime);
            }
        });
        const uniqueAnimeList = Array.from(uniqueAnimeMap.values());
        const duplicatesCount = animeList.length - uniqueAnimeList.length;
        
        if (duplicatesCount > 0) {
            logger.log(`🔄 Дедупликация: ${duplicatesCount} дубликатов удалено, осталось ${uniqueAnimeList.length} уникальных`, 'info');
        }

        // Трансформация данных
        logger.log(`🔄 Трансформация ${uniqueAnimeList.length} записей...`, 'info');
        const transformStart = Date.now();
        const animeRecordsToUpsert = await Promise.all(
            uniqueAnimeList.map(anime => transformToAnimeRecord(anime))
        );
        const transformTime = ((Date.now() - transformStart) / 1000).toFixed(2);
        logger.log(`✅ Трансформация завершена за ${transformTime}s`, 'success');
        
        // Сохранение в БД
        logger.log(`💾 Сохранение ${animeRecordsToUpsert.length} записей в БД...`, 'info');
        const dbStart = Date.now();
        const { data: upsertedAnimes, error: animeError } = await supabase
            .from('animes')
            .upsert(animeRecordsToUpsert, { onConflict: 'shikimori_id' })
            .select('id, shikimori_id');

        if (animeError) {
            logger.log(`❌ Ошибка сохранения в БД: ${animeError.message}`, 'error');
            throw animeError;
        }
        
        if (!upsertedAnimes || upsertedAnimes.length === 0) {
            logger.log('⚠️ Не удалось получить ID после вставки', 'warn');
            return NextResponse.json({ 
                message: "Нет данных для обновления", 
                processed: 0, 
                nextPageUrl: data.next_page || null,
                logs: logger.logs 
            });
        }
        
        const dbTime = ((Date.now() - dbStart) / 1000).toFixed(2);
        logger.log(`✅ Сохранено ${upsertedAnimes.length} записей за ${dbTime}s`, 'success');

        const animeIdMap = new Map(upsertedAnimes.map(a => [a.shikimori_id, a.id]));

        // Обработка связей
        logger.log(`🔗 Обработка связей для ${uniqueAnimeList.length} аниме...`, 'info');
        const relationsStart = Date.now();
        let genresCount = 0, studiosCount = 0, countriesCount = 0;
        
        for (const anime of uniqueAnimeList) {
            const animeId = animeIdMap.get(anime.shikimori_id!);
            if (animeId) {
                await processAllRelationsForAnime(supabase, anime, animeId);
                const material = anime.material_data || {};
                genresCount += material.anime_genres?.length || 0;
                studiosCount += material.anime_studios?.length || 0;
                countriesCount += material.countries?.length || 0;
            }
        }
        const relationsTime = ((Date.now() - relationsStart) / 1000).toFixed(2);
        logger.log(`✅ Связи обработаны за ${relationsTime}s (жанры: ${genresCount}, студии: ${studiosCount}, страны: ${countriesCount})`, 'success');
        
        // Сохранение озвучек
        logger.log(`🎙️ Обработка озвучек...`, 'info');
        const translationsStart = Date.now();
        const allTranslations = animeList
            .map(anime => {
                const anime_id = animeIdMap.get(anime.shikimori_id!);
                if (!anime_id || !anime.translation) return null;
                return {
                    anime_id,
                    kodik_translation_id: anime.translation.id,
                    title: anime.translation.title,
                    type: anime.translation.type,
                    quality: anime.quality,
                    player_link: anime.link.startsWith('//') ? `https:${anime.link}` : anime.link,
                };
            })
            .filter(Boolean) as any[];

        if (allTranslations.length > 0) {
            const { error: translationError } = await supabase
                .from('translations')
                .upsert(allTranslations, { onConflict: 'anime_id,kodik_translation_id' });
            
            if (translationError) {
                logger.log(`⚠️ Ошибка сохранения озвучек: ${translationError.message}`, 'warn');
            } else {
                const translationsTime = ((Date.now() - translationsStart) / 1000).toFixed(2);
                logger.log(`✅ Сохранено ${allTranslations.length} озвучек за ${translationsTime}s`, 'success');
            }
        } else {
            logger.log('⚠️ Озвучки не найдены', 'warn');
        }
        
        const totalTime = logger.getElapsed();
        logger.log(`🎉 Парсинг завершен за ${totalTime}s`, 'success');
        logger.log(`📊 Итого: ${uniqueAnimeList.length} аниме, ${allTranslations.length} озвучек`, 'info');
        
        return NextResponse.json({
            message: `Обработано: ${uniqueAnimeList.length} уникальных аниме, ${allTranslations.length} озвучек`,
            processed: uniqueAnimeList.length,
            translations: allTranslations.length,
            nextPageUrl: data.next_page || null,
            stats: {
                totalFromKodik,
                filteredOut: filteredCount,
                duplicates: duplicatesCount,
                unique: uniqueAnimeList.length,
                genres: genresCount,
                studios: studiosCount,
                countries: countriesCount,
                time: totalTime
            },
            logs: logger.logs
        });

    } catch (err: any) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        const errorStack = err instanceof Error ? err.stack : undefined;
        
        logger.log(`❌ Критическая ошибка: ${errorMessage}`, 'error');
        if (errorStack) {
            logger.log(`📋 Stack trace: ${errorStack.substring(0, 500)}`, 'error');
        }
        
        console.error("--- [PARSER_ERROR] ---", {
            message: errorMessage,
            stack: errorStack,
            timestamp: new Date().toISOString()
        });
        
        return NextResponse.json({ 
            error: errorMessage,
            logs: logger.logs,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}
