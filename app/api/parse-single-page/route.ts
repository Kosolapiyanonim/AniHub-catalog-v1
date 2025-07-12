// /app/api/parse-single-page/route.ts (ОТЛАДОЧНАЯ ВЕРСИЯ)

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { KodikAnimeData } from "@/lib/types";
import { transformToAnimeRecord, processAllRelationsForAnime } from "@/lib/parser-utils";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    console.log("--- [DEBUG] Запуск /api/parse-single-page ---");

    try {
        const KODIK_TOKEN = process.env.KODIK_API_TOKEN;
        const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

        console.log(`[DEBUG] KODIK_TOKEN существует: ${!!KODIK_TOKEN}`);
        console.log(`[DEBUG] SUPABASE_URL существует: ${!!SUPABASE_URL}`);
        console.log(`[DEBUG] SUPABASE_SERVICE_KEY существует: ${!!SUPABASE_SERVICE_KEY}`);

        if (!KODIK_TOKEN || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
            console.error("[DEBUG] КРИТИЧЕСКАЯ ОШИБКА: Отсутствуют переменные окружения.");
            return NextResponse.json({ error: "Переменные окружения не настроены на сервере" }, { status: 500 });
        }

        console.log("[DEBUG] Создание клиента Supabase...");
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
        console.log("[DEBUG] Клиент Supabase успешно создан.");
        
        const { nextPageUrl } = await request.json();
        const baseUrl = "https://kodikapi.com";
        let targetUrl: URL;

        if (nextPageUrl) {
            targetUrl = new URL(nextPageUrl);
        } else {
            targetUrl = new URL("/list", baseUrl);
            targetUrl.searchParams.set("token", KODIK_TOKEN);
            targetUrl.searchParams.set("types", "anime,anime-serial");
            targetUrl.searchParams.set("with_material_data", "true");
            targetUrl.searchParams.set("limit", "100");
        }
        
        console.log(`[DEBUG] Запрос к Kodik API по адресу: ${targetUrl.toString()}`);
        const response = await fetch(targetUrl);
        console.log(`[DEBUG] Ответ от Kodik API получен. Статус: ${response.status}`);

        if (!response.ok) {
            throw new Error(`Ошибка ответа от Kodik API: ${response.status}`);
        }
        
        const data = await response.json();
        const animeList: KodikAnimeData[] = data.results || [];
        console.log(`[DEBUG] Получено ${animeList.length} записей от Kodik.`);

        // ... (дальнейшая логика обработки остается без изменений)
        // Если код дойдет до сюда, значит проблема не в подключении.

        const uniqueAnimeMap = new Map<string, KodikAnimeData>();
        animeList.forEach(anime => {
            if (anime.shikimori_id && !uniqueAnimeMap.has(anime.shikimori_id)) {
                uniqueAnimeMap.set(anime.shikimori_id, anime);
            }
        });
        const uniqueAnimeList = Array.from(uniqueAnimeMap.values());

        const animeRecordsToUpsert = uniqueAnimeList.map(transformToAnimeRecord);
        const { data: upsertedAnimes, error: animeError } = await supabase
            .from('animes')
            .upsert(animeRecordsToUpsert, { onConflict: 'shikimori_id' })
            .select('id, shikimori_id');

        if (animeError) throw animeError;
        if (!upsertedAnimes) return NextResponse.json({ message: "Нет данных для обновления", processed: 0, nextPageUrl: data.next_page || null });

        const animeIdMap = new Map(upsertedAnimes.map(a => [a.shikimori_id, a.id]));

        for (const anime of uniqueAnimeList) {
            const animeId = animeIdMap.get(anime.shikimori_id!);
            if (animeId) {
                await processAllRelationsForAnime(supabase, anime, animeId);
            }
        }
        
        const allTranslations = animeList.map(anime => {
            const anime_id = animeIdMap.get(anime.shikimori_id!);
            if (!anime_id) return null;
            return {
                anime_id,
                kodik_id: anime.id,
                title: anime.translation.title,
                type: anime.translation.type,
                quality: anime.quality,
                player_link: anime.link,
            };
        }).filter(Boolean);

        if(allTranslations.length > 0) {
            await supabase.from('translations').upsert(allTranslations, { onConflict: 'kodik_id' });
        }
        
        console.log("[DEBUG] Обработка данных завершена успешно.");
        
        return NextResponse.json({
            message: `Обработано. Сохранено/обновлено: ${uniqueAnimeList.length} уникальных аниме и ${allTranslations.length} озвучек.`,
            processed: uniqueAnimeList.length,
            nextPageUrl: data.next_page || null,
        });

    } catch (err: any) {
        // УЛУЧШЕННЫЙ БЛОК ПЕРЕХВАТА ОШИБОК
        console.error("--- [DEBUG] КРИТИЧЕСКАЯ ОШИБКА ВНУТРИ CATCH ---");
        console.error("[DEBUG] Сообщение:", err.message);
        console.error("[DEBUG] Стек:", err.stack);
        console.error("[DEBUG] Полный объект ошибки:", JSON.stringify(err, null, 2));
        
        return NextResponse.json({ error: "Произошла критическая ошибка на сервере. См. логи." }, { status: 500 });
    }
}
