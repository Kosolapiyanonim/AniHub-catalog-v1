// /app/api/parser/route.ts

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { KodikAnimeData, AnimeRecord } from "@/lib/types";

// Вспомогательная функция для обработки связей
async function processRelations(
  anime_id: number,
  items: string[],
  relation_type: "genre" | "studio" | "country"
) {
  if (!items || items.length === 0) return;

  const tableName = relation_type === "country" ? "countries" : `${relation_type}s`;

  for (const name of items) {
    if (!name?.trim()) continue;
    try {
      const { data: relData, error: relErr } = await supabase
        .from(tableName)
        .upsert({ name: name.trim() }, { onConflict: "name" })
        .select("id")
        .single();

      if (relErr) throw relErr;

      await supabase
        .from("anime_relations")
        .upsert(
          { anime_id, relation_id: relData.id, relation_type },
          { onConflict: "anime_id,relation_id,relation_type" }
        );
    } catch (error) {
      console.error(`Ошибка обработки связи ${relation_type} - ${name}:`, error);
    }
  }
}

// Основной обработчик POST-запроса
export async function POST(request: Request) {
  const output: string[] = [];
  const log = (message: string) => {
    console.log(message);
    output.push(message);
  };

  try {
    log("🚀 Запуск TypeScript-парсера...");

    const body = await request.json().catch(() => ({}));
    const pagesToParse = body.pagesToParse || 1;
    let currentPageUrl: string | null = `https://kodikapi.com/list`;
    let pagesParsed = 0;

    const KODIK_TOKEN = process.env.KODIK_API_TOKEN;
    if (!KODIK_TOKEN) throw new Error("KODIK_API_TOKEN не настроен в переменных окружения");

    log(`✅ Конфигурация проверена. Цель: ${pagesToParse} страниц.`);

    log("🔍 Получаем ID существующих аниме из базы...");
    const { data: existingIdsData, error: idsError } = await supabase.from("animes").select("shikimori_id");
    if (idsError) throw idsError;
    const existingShikimoriIds = new Set(existingIdsData.map(item => item.shikimori_id));
    log(`✅ В базе найдено ${existingShikimoriIds.size} уникальных аниме.`);

    // Цикл пагинации
    while (pagesParsed < pagesToParse && currentPageUrl) {
      pagesParsed++;
      log("-".repeat(50));
      log(`🌀 Обработка страницы №${pagesParsed}...`);

      const params = new URLSearchParams({
        token: KODIK_TOKEN,
        limit: "100",
        types: "anime,anime-serial",
        with_material_data: "true",
        sort: "shikimori_rating",
        order: "desc",
      });

      const response = await fetch(`${currentPageUrl}?${params.toString()}`);
      if (!response.ok) throw new Error(`Ошибка от Kodik API: ${response.statusText}`);

      const data = await response.json();
      const rawAnimeList: KodikAnimeData[] = data.results || [];

      const newAnimes = rawAnimeList.filter(anime => anime.shikimori_id && !existingShikimoriIds.has(anime.shikimori_id));
      log(`🔄 Получено ${rawAnimeList.length} записей. Из них новых для нашей базы: ${newAnimes.length}.`);

      if (newAnimes.length > 0) {
        for (const anime of newAnimes) {
            const material = anime.material_data || {};
            log(`  📥 Сохранение: ${anime.title || 'Без названия'}`);

            try {
                // --- НАЧАЛО: ПОЛНЫЙ ОБЪЕКТ ДЛЯ ЗАПИСИ ---
                const record: AnimeRecord = {
                    kodik_id: anime.id,
                    shikimori_id: anime.shikimori_id!,
                    kinopoisk_id: anime.kinopoisk_id,
                    title: anime.title,
                    title_orig: anime.title_orig,
                    year: anime.year,
                    poster_url: material.anime_poster_url || material.poster_url, // <-- ИЗМЕНЕНИЕ ЗДЕСЬ
                    player_link: anime.link,
                    description: material.description || material.anime_description,
                    type: anime.type,
                    status: material.anime_status,
                    episodes_count: anime.episodes_count,
                    rating_mpaa: material.rating_mpaa,
                    kinopoisk_rating: material.kinopoisk_rating,
                    shikimori_rating: material.shikimori_rating,
                    kinopoisk_votes: material.kinopoisk_votes,
                    shikimori_votes: material.shikimori_votes,
                    screenshots: { screenshots: anime.screenshots || [] },
                    updated_at_kodik: anime.updated_at,
                };
                // --- КОНЕЦ: ПОЛНЫЙ ОБЪЕКТ ДЛЯ ЗАПИСИ ---

                const { data: upserted, error: upsertError } = await supabase.from('animes').upsert(record, { onConflict: 'shikimori_id' }).select('id').single();

                if (upsertError) {
                    log(`      - ❌ Ошибка сохранения аниме ${anime.title}: ${upsertError.message}`);
                    continue;
                }

                await processRelations(upserted.id, material.anime_genres || [], 'genre');
                await processRelations(upserted.id, material.anime_studios || [], 'studio');
                await processRelations(upserted.id, material.countries || [], 'country');
                
                existingShikimoriIds.add(anime.shikimori_id!);
                log(`      - ✅ Сохранено в БД (ID: ${upserted.id})`);

            } catch (e) {
                log(`      - ❌ Ошибка обработки '${anime.title}': ${e instanceof Error ? e.message : String(e)}`);
            }
        }
      }
      
      currentPageUrl = data.next_page;
      if (!currentPageUrl) log("🏁 Достигнут конец списка Kodik API.");
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    log("🎉 Парсинг завершен!");
    return NextResponse.json({ status: 'success', output: output.join('\n') });

  } catch (err) {
    const message = err instanceof Error ? err.message : "Неизвестная ошибка";
    return NextResponse.json({ status: 'error', message, output: output.join('\n') }, { status: 500 });
  }
}
