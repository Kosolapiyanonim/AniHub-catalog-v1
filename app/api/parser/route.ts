// /app/api/parser/route.ts

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { KodikAnimeData, AnimeRecord } from "@/lib/types";

// Вспомогательная функция для обработки связей (жанры, студии, страны)
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
      const { data: relData } = await supabase
        .from(tableName)
        .upsert({ name: name.trim() }, { onConflict: "name" })
        .select("id")
        .single();
      if (relData) {
        await supabase
          .from("anime_relations")
          .upsert(
            { anime_id, relation_id: relData.id, relation_type },
            { onConflict: "anime_id,relation_id,relation_type" }
          );
      }
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
    let currentPageUrl: string | null = "https://kodikapi.com/list";
    let pagesParsed = 0;
    let totalNew = 0;
    let totalUpdated = 0;

    const KODIK_TOKEN = process.env.KODIK_API_TOKEN;
    if (!KODIK_TOKEN) throw new Error("KODIK_API_TOKEN не настроен");
    log(`✅ Конфигурация проверена. Цель: ${pagesToParse} страниц.`);

    // Цикл пагинации (волнообразный парсинг)
    while (pagesParsed < pagesToParse && currentPageUrl) {
      pagesParsed++;
      log("-".repeat(50));
      log(`🌊 Волна №${pagesParsed}. Запрос к Kodik API...`);

      const params = new URLSearchParams({
        token: KODIK_TOKEN,
        limit: "100",
        types: "anime,anime-serial",
        with_material_data: "true",
        sort: "updated_at", // Сортируем по последним обновленным, чтобы получать новинки
        order: "desc",
      });

      const response = await fetch(`${currentPageUrl}?${params.toString()}`);
      if (!response.ok) {
        log(`❗️ Ошибка от Kodik API на странице ${pagesParsed}, пропускаем...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        continue;
      }

      const data = await response.json();
      const animeListFromKodik: KodikAnimeData[] = data.results || [];
      log(`🔄 Получено ${animeListFromKodik.length} записей для обработки.`);
      
      if (animeListFromKodik.length === 0) {
        currentPageUrl = data.next_page;
        continue;
      }

      // 1. Собираем все shikimori_id со страницы от Kodik
      const shikimoriIdsFromPage = animeListFromKodik
        .map(anime => anime.shikimori_id)
        .filter(Boolean) as string[];

      // 2. Узнаем, какие из этих ID уже есть в нашей базе
      const { data: existingAnimes, error: dbError } = await supabase
        .from('animes')
        .select('shikimori_id')
        .in('shikimori_id', shikimoriIdsFromPage);
      
      if (dbError) throw dbError;

      const existingIdsSet = new Set(existingAnimes.map(a => a.shikimori_id));
      log(`🔍 Из ${shikimoriIdsFromPage.length} аниме, ${existingIdsSet.size} уже есть в базе. Будут обновлены. ${shikimoriIdsFromPage.length - existingIdsSet.size} будут добавлены.`);

      // 3. Обрабатываем каждое аниме
      for (const anime of animeListFromKodik) {
        if (!anime.shikimori_id) continue;

        const material = anime.material_data || {};
        
        const record: AnimeRecord = {
          kodik_id: anime.id,
          shikimori_id: anime.shikimori_id,
          kinopoisk_id: anime.kinopoisk_id,
          title: anime.title,
          title_orig: anime.title_orig,
          year: anime.year,
          poster_url: material.anime_poster_url || material.poster_url, // Приоритет Shikimori
          player_link: anime.link,
          // Расширенная логика получения данных
          description: material.description || material.anime_description || "Описание отсутствует.",
          type: anime.type,
          status: material.anime_status,
          episodes_count: anime.episodes_count || material.episodes_total || 0,
          rating_mpaa: material.rating_mpaa,
          kinopoisk_rating: material.kinopoisk_rating,
          shikimori_rating: material.shikimori_rating,
          kinopoisk_votes: material.kinopoisk_votes,
          shikimori_votes: material.shikimori_votes,
          screenshots: { screenshots: anime.screenshots || [] },
          updated_at_kodik: anime.updated_at,
        };

        const { data: upserted, error: upsertError } = await supabase
          .from('animes')
          .upsert(record, { onConflict: 'shikimori_id' })
          .select('id')
          .single();

        if (upsertError) {
          log(`  - ❌ Ошибка обработки '${anime.title}': ${upsertError.message}`);
          continue;
        }

        // Логика для статистики
        if (existingIdsSet.has(anime.shikimori_id)) {
          totalUpdated++;
          log(`  - 🔄 Обновлено: ${anime.title}`);
        } else {
          totalNew++;
          log(`  - ✅ Добавлено новое: ${anime.title}`);
        }
        
        await processRelations(upserted.id, material.anime_genres || [], 'genre');
        await processRelations(upserted.id, material.anime_studios || [], 'studio');
        await processRelations(upserted.id, material.countries || [], 'country');
      }
      
      currentPageUrl = data.next_page;
      if (!currentPageUrl) log("🏁 Достигнут конец списка Kodik API.");
      await new Promise(resolve => setTimeout(resolve, 1000)); // Пауза между волнами
    }

    log("=" .repeat(50));
    log(`🎉 Парсинг завершен!`);
    log(`📊 Результат: Добавлено ${totalNew} новых, обновлено ${totalUpdated}.`);

    return NextResponse.json({ status: 'success', output: output.join('\n') });

  } catch (err) {
    const message = err instanceof Error ? err.message : "Неизвестная ошибка";
    log(`❌ Критическая ошибка: ${message}`);
    return NextResponse.json({ status: 'error', message, output: output.join('\n') }, { status: 500 });
  }
}
