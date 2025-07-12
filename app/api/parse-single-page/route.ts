// /app/api/parse-single-page/route.ts (ОТЛАДОЧНАЯ ВЕРСИЯ)

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
        const animeList: KodikAnimeData[] = data.results || [];

        if (animeList.length === 0) {
            return NextResponse.json({ message: "Страница пуста. Возможно, достигнут конец.", processed: 0, nextPageUrl: data.next_page || null });
        }

        const uniqueAnimeMap = new Map<string, KodikAnimeData>();
        animeList.forEach(anime => {
            if (anime.shikimori_id && !uniqueAnimeMap.has(anime.shikimori_id)) {
                uniqueAnimeMap.set(anime.shikimori_id, anime);
            }
        });
        const uniqueAnimeList = Array.from(uniqueAnimeMap.values());

        if (uniqueAnimeList.length === 0) {
             return NextResponse.json({ message: "На странице не найдено записей с shikimori_id.", processed: 0, nextPageUrl: data.next_page || null });
        }

        const animeRecordsToUpsert = uniqueAnimeList.map(transformToAnimeRecord);
        const { data: upsertedAnimes, error: animeError } = await supabase
            .from('animes')
            .upsert(animeRecordsToUpsert, { onConflict: 'shikimori_id' })
            .select('id, shikimori_id');

        if (animeError) throw animeError;
        if (!upsertedAnimes) return NextResponse.json({ message: "Нет данных для обновления", processed: 0, nextPageUrl: data.next_page || null });

        const animeIdMap = new Map(upsertedAnimes.map(a => [a.shikimori_id, a.id]));
