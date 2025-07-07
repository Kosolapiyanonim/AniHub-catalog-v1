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
    let newAnimeCount = 0;
    let updatedAnimeCount = 0;

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
        sort: "shikimori_rating",
        order: "desc",
      });

      const response = await fetch(`${currentPageUrl}?${params.toString()}`);
      if (!response.ok) throw new Error(`Ошибка от Kodik API: ${response.statusText}`);

      const data = await response.json();
      const animeList: KodikAnimeData[] = data.results || [];
      log(`🔄 Получено ${animeList.length} записей для обработки.`);

      for (const anime of animeList) {
        if (!anime.shikimori_id) continue; // Пропускаем записи без ID

        const material = anime.material_data || {};
        
        // Формируем запись для базы данных
        const record: AnimeRecord = {
          kodik_id: anime.id,
          shikimori_id: anime.shikimori_id,
          kinopoisk_id: anime.kinopoisk_id,
          title: anime.title,
          title_orig: anime.title_orig,
          year: anime.year,
          // Отдаем приоритет постеру с Shikimori
          poster_url: material.anime_poster_url || material.poster_url,
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

        // upsert - это "умная" команда: она обновит запись, если она есть, или создаст новую, если ее нет.
        const { data: upserted, error: upsertError } = await supabase
          .from('animes')
          .upsert(record, { onConflict: 'shikimori_id' })
          .select('created_at') // Запрашиваем created_at, чтобы понять, новая ли запись
          .single();

        if (upsertError) {
          log(`  - ❌ Ошибка обработки '${anime.title}': ${upsertError.message}`);
          continue;
        }

        // Проверяем, была ли запись создана только что
        const isNew = new Date().getTime() - new Date(upserted.created_at).getTime() < 5000; // 5 секунд
        if (isNew) {
          newAnimeCount++;
          log(`  - ✅ Добавлено новое: ${anime.title}`);
        } else {
          updatedAnimeCount++;
          log(`  - 🔄 Обновлено: ${anime.title}`);
        }

        const { data: animeEntry } = await supabase.from('animes').select('id').eq('shikimori_id', anime.shikimori_id).single();
        if (animeEntry) {
            await processRelations(animeEntry.id, material.anime_genres || [], 'genre');
            await processRelations(animeEntry.id, material.anime_studios || [], 'studio');
            await processRelations(animeEntry.id, material.countries || [], 'country');
        }
      }
      
      currentPageUrl = data.next_page;
      if (!currentPageUrl) log("🏁 Достигнут конец списка Kodik API.");
      await new Promise(resolve => setTimeout(resolve, 500)); // Пауза между волнами
    }

    log("=" .repeat(50));
    log(`🎉 Парсинг завершен!`);
    log(`📊 Результат: Добавлено ${newAnimeCount} новых, обновлено ${updatedAnimeCount}.`);

    return NextResponse.json({ status: 'success', output: output.join('\n') });

  } catch (err) {
    const message = err instanceof Error ? err.message : "Неизвестная ошибка";
    log(`❌ Критическая ошибка: ${message}`);
    return NextResponse.json({ status: 'error', message, output: output.join('\n') }, { status: 500 });
  }
}
