// /app/api/full-parser/route.ts

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
      const { data: relData } = await supabase.from(tableName).upsert({ name: name.trim() }, { onConflict: 'name' }).select('id').single();
      if (relData) {
        await supabase.from('anime_relations').upsert({ anime_id, relation_id: relData.id, relation_type }, { onConflict: 'anime_id,relation_id,relation_type' });
      }
    } catch (error) {
      console.error(`Ошибка связи ${relation_type} - ${name}:`, error);
    }
  }
}

// Основной обработчик POST-запроса
export async function POST() {
  const output: string[] = [];
  const log = (message: string) => {
    console.log(message);
    output.push(message);
  };

  try {
    log("🚀 Запуск ПОЛНОЙ синхронизации базы данных...");

    const KODIK_TOKEN = process.env.KODIK_API_TOKEN;
    if (!KODIK_TOKEN) throw new Error("KODIK_API_TOKEN не настроен");

    let currentPageUrl: string | null = "https://kodikapi.com/list";
    let pagesParsed = 0;
    let totalNew = 0;
    let totalUpdated = 0;

    // Цикл для обхода всех страниц Kodik API
    while (currentPageUrl) {
      pagesParsed++;
      log("-".repeat(50));
      log(`🌊 Волна №${pagesParsed}. Запрос к Kodik...`);

      const params = new URLSearchParams({ token: KODIK_TOKEN, limit: "100", with_material_data: "true" });
      const response = await fetch(`${currentPageUrl}?${params.toString()}`);
      
      if (!response.ok) {
        log(`❗️ Ошибка от Kodik API на странице ${pagesParsed}, пропускаем...`);
        await new Promise(resolve => setTimeout(resolve, 5000)); // Ждем 5 секунд и пробуем дальше
        continue;
      }

      const data = await response.json();
      const animeList: KodikAnimeData[] = data.results || [];
      log(`🔄 Получено ${animeList.length} записей для обработки.`);

      // Создаем массив записей для операции upsert
      const recordsToUpsert = animeList
        .filter(anime => anime.shikimori_id) // Убираем записи без shikimori_id
        .map(anime => {
          const material = anime.material_data || {};
          return {
            shikimori_id: anime.shikimori_id, // Ключ для проверки конфликта
            kodik_id: anime.id,
            title: anime.title,
            title_orig: anime.title_orig,
            year: anime.year,
            poster_url: material.anime_poster_url || material.poster_url, // Правильный приоритет постеров
            player_link: anime.link,
            description: material.description || material.anime_description,
            type: anime.type,
            status: material.anime_status,
            episodes_count: anime.episodes_count,
            shikimori_rating: material.shikimori_rating,
            shikimori_votes: material.shikimori_votes,
            updated_at_kodik: anime.updated_at,
          };
        });

      // Выполняем массовый upsert
      const { data: upsertedData, error } = await supabase
        .from('animes')
        .upsert(recordsToUpsert, { onConflict: 'shikimori_id' })
        .select('id, shikimori_id');

      if (error) {
        log(`❌ Ошибка массового сохранения: ${error.message}`);
        continue;
      }

      log(`✅ Сохранено/обновлено ${upsertedData?.length || 0} аниме в базе.`);
      totalUpdated += upsertedData?.length || 0;
      
      currentPageUrl = data.next_page;
      if (!currentPageUrl) log("🏁 Достигнут конец списка Kodik API.");
      await new Promise(resolve => setTimeout(resolve, 1000)); // Пауза 1 секунда между запросами
    }

    log("=" .repeat(50));
    log(`🎉 Полная синхронизация завершена! Обработано страниц: ${pagesParsed}.`);
    log(`📊 Всего обновлено/добавлено: ${totalUpdated} записей.`);
    
    return NextResponse.json({ status: 'success', output: output.join('\n') });

  } catch (err) {
    const message = err instanceof Error ? err.message : "Неизвестная ошибка";
    return NextResponse.json({ status: 'error', message, output: output.join('\n') }, { status: 500 });
  }
}
