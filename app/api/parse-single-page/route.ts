// /app/api/parse-single-page/route.ts

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { KodikAnimeData } from "@/lib/types";
import { transformToAnimeRecord, processAllRelationsForAnime } from "@/lib/parser-utils";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    const KODIK_TOKEN = process.env.KODIK_API_TOKEN;
    if (!KODIK_TOKEN) {
        return NextResponse.json({ error: "KODIK_API_TOKEN не настроен" }, { status: 500 });
    }

    try {
        const { nextPageUrl } = await request.json();
        const baseUrl = "https://kodikapi.com";
        let targetUrl: URL;

        if (nextPageUrl) {
            targetUrl = new URL(nextPageUrl, baseUrl);
        } else {
            targetUrl = new URL("/list", baseUrl);
            targetUrl.searchParams.set("token", KODIK_TOKEN);
            targetUrl.searchParams.set("types", "anime,anime-serial");
            targetUrl.searchParams.set("with_material_data", "true");
            targetUrl.searchParams.set("limit", "100");
        }

        const response = await fetch(targetUrl);
        if (!response.ok) throw new Error(`Ошибка от API Kodik: ${response.status}`);

        const data = await response.json();
        const animeList: KodikAnimeData[] = data.results || [];
        if (animeList.length === 0) {
            return NextResponse.json({ message: `Страница пуста.`, processed: 0, nextPageUrl: data.next_page || null });
        }

        const uniqueAnimeMap = new Map<string, KodikAnimeData>();
        animeList.forEach(anime => {
            if (anime.shikimori_id && !uniqueAnimeMap.has(anime.shikimori_id)) {
                uniqueAnimeMap.set(anime.shikimori_id, anime);
            }
        });
        const uniqueAnimeList = Array.from(uniqueAnimeMap.values());

        if (uniqueAnimeList.length === 0) {
            return NextResponse.json({ message: `На странице не найдено записей с shikimori_id.`, processed: 0, nextPageUrl: data.next_page || null });
        }
        
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
        
        return NextResponse.json({
            message: `Обработано. Сохранено/обновлено: ${upsertedAnimes.length} записей.`,
            processed: upsertedAnimes.length,
            nextPageUrl: data.next_page || null,
        });

    } catch (err) {
        const message = err instanceof Error ? err.message : "Неизвестная ошибка";
        console.error("Parser Error:", err);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
