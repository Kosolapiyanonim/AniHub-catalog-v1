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
        const animeList: KodikAnimeData[] = (data.results || []).filter((anime: any) => anime.shikimori_id);

        if (animeList.length === 0) {
            return NextResponse.json({ message: "На странице не найдено аниме с shikimori_id.", processed: 0, nextPageUrl: data.next_page || null });
        }

        // --- ДОБАВЛЕНО ЛОГИРОВАНИЕ ---
        console.log(`[Parser] Начинаю обработку ${animeList.length} записей...`);

        for (const animeData of animeList) {
            // ВЫВОДИМ НАЗВАНИЕ КАЖДОГО АНИМЕ В ЛОГ VERCEL
            console.log(`[Parser] Обработка: ${animeData.title} (Shikimori ID: ${animeData.shikimori_id})`);

            // --- Логика обработки, как и раньше ---
            const uniqueAnime = transformToAnimeRecord(animeData);
            const { data: savedAnime, error: animeError } = await supabase
                .from('animes')
                .upsert(uniqueAnime, { onConflict: 'shikimori_id' })
                .select('id, shikimori_id')
                .single();

            if (animeError) {
                console.error(`[Parser] Ошибка при сохранении аниме ${animeData.title}:`, animeError.message);
                continue; // Пропускаем это аниме и идем дальше
            }
            if (!savedAnime) continue;

            await processAllRelationsForAnime(supabase, animeData, savedAnime.id);

            await supabase.from('translations').upsert({
                anime_id: savedAnime.id,
                kodik_id: animeData.id,
                title: animeData.translation.title,
                type: animeData.translation.type,
                quality: animeData.quality,
                player_link: animeData.link,
            }, { onConflict: 'kodik_id' });
        }
        
        return NextResponse.json({
            message: `Успешно обработано ${animeList.length} записей.`,
            processed: animeList.length,
            nextPageUrl: data.next_page || null,
        });

    } catch (err: any) {
        console.error("--- [PARSER_ERROR] КРИТИЧЕСКАЯ ОШИБКА ---");
        console.error("[PARSER_ERROR] Сообщение:", err.message);
        return NextResponse.json({ error: "Произошла критическая ошибка. См. логи Vercel." }, { status: 500 });
    }
}
