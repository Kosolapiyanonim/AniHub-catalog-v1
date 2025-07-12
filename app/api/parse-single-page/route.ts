// /app/api/parse-single-page/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { KodikAnimeData } from "@/lib/types";
import { transformToAnimeRecord, processAllRelationsForAnime } from "@/lib/parser-utils";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const KODIK_TOKEN = process.env.KODIK_API_TOKEN;
        const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!KODIK_TOKEN || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
            throw new Error("Одна или несколько переменных окружения не настроены на сервере.");
        }
        
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
        
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

        const response = await fetch(targetUrl);
        if (!response.ok) {
             const errorBody = await response.text();
             throw new Error(`Ошибка ответа от Kodik API: ${response.status}. Ответ: ${errorBody}`);
        }
        
        const data = await response.json();
        const animeList: KodikAnimeData[] = (data.results || []).filter((anime: any) => anime.id);

        if (animeList.length === 0) {
            return NextResponse.json({ message: "Страница пуста. Возможно, достигнут конец.", processed: 0, nextPageUrl: data.next_page || null });
        }

        // --- ИЗМЕНЕНИЕ: Теперь мы обрабатываем КАЖДУЮ запись от Kodik ---
        const animeRecordsToUpsert = animeList.map(transformToAnimeRecord);
        
        // Используем onConflict: 'kodik_id' для таблицы animes
        const { data: upsertedAnimes, error: animeError } = await supabase
            .from('animes')
            .upsert(animeRecordsToUpsert, { onConflict: 'kodik_id' }) // <-- ГЛАВНОЕ ИЗМЕНЕНИЕ
            .select('id, kodik_id');

        if (animeError) throw animeError;
        if (!upsertedAnimes) return NextResponse.json({ message: "Нет данных для обновления", processed: 0, nextPageUrl: data.next_page || null });

        // Связи и озвучки обрабатываем для каждой записи
        const animeIdMap = new Map(upsertedAnimes.map(a => [a.kodik_id, a.id]));

        for (const anime of animeList) {
            const animeId = animeIdMap.get(anime.id!);
            if (animeId) {
                // Обрабатываем жанры и студии
                await processAllRelationsForAnime(supabase, anime, animeId);
                
                // Сохраняем озвучку в отдельную таблицу
                await supabase.from('translations').upsert({
                    anime_id: animeId,
                    kodik_id: anime.id,
                    title: anime.translation.title,
                    type: anime.translation.type,
                    quality: anime.quality,
                    player_link: anime.link,
                }, { onConflict: 'kodik_id' });
            }
        }
        
        return NextResponse.json({
            message: `Обработано: ${animeList.length} записей.`,
            processed: animeList.length,
            nextPageUrl: data.next_page || null,
        });

    } catch (err: any) {
        console.error("--- [PARSER_ERROR] КРИТИЧЕСКАЯ ОШИБКА ---");
        console.error("[PARSER_ERROR] Сообщение:", err.message);
        if (err.code) {
             console.error("[PARSER_ERROR] Код Supabase:", err.code);
        }
        return NextResponse.json({ error: "Произошла критическая ошибка на сервере." }, { status: 500 });
    }
}
