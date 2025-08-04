// /app/api/parser/route.ts

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { KodikAnimeData } from "@/lib/types";

// ====================================================================
// GET-обработчик для проверки статуса (решает ошибку 405)
// ====================================================================
export async function GET() {
  return NextResponse.json({ status: "ok", message: "Parser API is online." });
}

// ====================================================================
// Вспомогательные функции для ОПТИМИЗИРОВАННОЙ обработки связей
// ====================================================================

/**
 * Обрабатывает один тип связей (например, все жанры со страницы) одним пакетом.
 */
async function processRelationsBatch(
  supabaseClient: any,
  relationData: { anime_id: number; name: string }[],
  relation_type: "genre" | "studio" | "country"
) {
  if (!relationData || relationData.length === 0) return;

  const tableName = relation_type === "country" ? "countries" : `${relation_type}s`;
  const idFieldName = `${relation_type}_id`;
  const relationTableName = `anime_${tableName}`;

  // 1. Получаем уникальные имена и добавляем их в справочник (genres, studios, etc.)
  const uniqueNames = [...new Set(relationData.map(r => r.name))];
  const { data: existingItems, error: upsertError } = await supabaseClient
    .from(tableName)
    .upsert(uniqueNames.map(name => ({ name })), { onConflict: 'name' })
    .select('id, name');

  if (upsertError) throw upsertError;
  if (!existingItems) return;

  // 2. Создаем карту "имя -> id" для быстрого доступа
  const itemMap = new Map(existingItems.map(item => [item.name, item.id]));

  // 3. Формируем записи для таблицы связей (anime_genres, etc.)
  const relationsToUpsert = relationData
    .map(rel => {
      const relationId = itemMap.get(rel.name);
      if (!relationId) return null;
      return {
        anime_id: rel.anime_id,
        [idFieldName]: relationId,
      };
    })
    .filter(Boolean);

  // 4. Добавляем все связи одним запросом
  if (relationsToUpsert.length > 0) {
    const { error: relationError } = await supabaseClient
      .from(relationTableName)
      .upsert(relationsToUpsert, { onConflict: `anime_id,${idFieldName}` });
    
    if (relationError) console.error(`Ошибка при пакетной вставке в ${relationTableName}:`, relationError);
  }
}


// ====================================================================
// Основной POST-обработчик с новой, оптимизированной логикой
// ====================================================================
export async function POST(request: Request) {
  const output: string[] = [];
  const log = (message: string) => {
    console.log(message);
    output.push(message);
  };

  try {
    log("🚀 Запуск оптимизированного парсера...");
    const body = await request.json().catch(() => ({}));
    const pagesToParse = body.pagesToParse || 1;
    let currentPageUrl: string | null = "https://kodikapi.com/list"; // Используем базовый URL, параметры добавим ниже
    let pagesParsed = 0;
    let totalNew = 0;
    let totalUpdated = 0;

    const KODIK_TOKEN = process.env.KODIK_API_TOKEN;
    if (!KODIK_TOKEN) throw new Error("KODIK_API_TOKEN не настроен");
    log(`✅ Конфигурация проверена. Цель: ${pagesToParse} страниц.`);

    while (pagesParsed < pagesToParse && currentPageUrl) {
      pagesParsed++;
      log("-".repeat(50));
      log(`🌊 Волна №${pagesParsed}. Запрос к Kodik API...`);

      const targetUrl = new URL(currentPageUrl);
      targetUrl.searchParams.set("token", KODIK_TOKEN);
      targetUrl.searchParams.set("limit", "100");
      targetUrl.searchParams.set("types", "anime,anime-serial");
      targetUrl.searchParams.set("with_material_data", "true");
      
      const response = await fetch(targetUrl);
      if (!response.ok) {
        log(`❗️ Ошибка от Kodik API на странице ${pagesParsed}, пропускаем...`);
        continue;
      }

      const data = await response.json();
      const animeListFromKodik: KodikAnimeData[] = data.results || [];
      log(`🔄 Получено ${animeListFromKodik.length} записей для обработки.`);
      
      if (animeListFromKodik.length === 0) {
        currentPageUrl = data.next_page;
        continue;
      }

      // 1. Отбираем только уникальные аниме по shikimori_id
      const uniqueAnimeMap = new Map<string, KodikAnimeData>();
      animeListFromKodik.forEach(anime => {
        if (anime.shikimori_id && !uniqueAnimeMap.has(anime.shikimori_id)) {
            uniqueAnimeMap.set(anime.shikimori_id, anime);
        }
      });
      const uniqueAnimeList = Array.from(uniqueAnimeMap.values());
      const shikimoriIds = uniqueAnimeList.map(a => a.shikimori_id!);

      // 2. Узнаем, какие из этих ID уже есть в нашей базе для статистики
      const { data: existingAnimes } = await supabase.from('animes').select('shikimori_id').in('shikimori_id', shikimoriIds);
      const existingIdsSet = new Set(existingAnimes?.map(a => a.shikimori_id));

      // 3. Формируем и вставляем/обновляем ОСНОВНЫЕ записи аниме
      const animeRecordsToUpsert = uniqueAnimeList.map(anime => {
          const material = anime.material_data || {};
          return {
            shikimori_id: anime.shikimori_id,
            kinopoisk_id: anime.kinopoisk_id,
            title: material.anime_title || anime.title,
            title_orig: anime.title_orig,
            year: anime.year,
            poster_url: material.anime_poster_url || material.poster_url,
            description: material.anime_description || material.description || "Описание отсутствует.",
            type: anime.type,
            status: material.anime_status,
            episodes_count: anime.episodes_count || material.episodes_total || 0,
            rating_mpaa: material.rating_mpaa,
            kinopoisk_rating: material.kinopoisk_rating,
            imdb_rating: material.imdb_rating,
            shikimori_rating: material.shikimori_rating,
            kinopoisk_votes: material.kinopoisk_votes,
            shikimori_votes: material.shikimori_votes,
            screenshots: { screenshots: anime.screenshots || [] },
            updated_at_kodik: anime.updated_at,
            raw_data: anime,
          };
      });

      const { data: upsertedAnimes, error: upsertError } = await supabase
        .from('animes')
        .upsert(animeRecordsToUpsert, { onConflict: 'shikimori_id' })
        .select('id, shikimori_id');

      if (upsertError) throw upsertError;
      if (!upsertedAnimes) {
          log("❗️ Не удалось получить ID после вставки/обновления, связи не будут обработаны.");
          continue;
      }
      
      log(`💾 Сохранено/обновлено ${upsertedAnimes.length} основных записей аниме.`);

      // 4. **ОПТИМИЗАЦИЯ**: Собираем ВСЕ связи со страницы в один массив
      const animeIdMap = new Map(upsertedAnimes.map(a => [a.shikimori_id, a.id]));
      const allGenres: { anime_id: number; name: string }[] = [];
      const allStudios: { anime_id: number; name: string }[] = [];
      const allCountries: { anime_id: number; name: string }[] = [];

      for (const anime of uniqueAnimeList) {
        const animeId = animeIdMap.get(anime.shikimori_id!);
        if (!animeId) continue;

        const material = anime.material_data || {};
        material.anime_genres?.forEach(name => allGenres.push({ anime_id: animeId, name }));
        material.anime_studios?.forEach(name => allStudios.push({ anime_id: animeId, name }));
        material.countries?.forEach(name => allCountries.push({ anime_id: animeId, name }));
      }

      // 5. Выполняем пакетную обработку для каждого типа связей
      log(`⚙️ Обработка связей: ${allGenres.length} жанров, ${allStudios.length} студий, ${allCountries.length} стран...`);
      await Promise.all([
        processRelationsBatch(supabase, allGenres, 'genre'),
        processRelationsBatch(supabase, allStudios, 'studio'),
        processRelationsBatch(supabase, allCountries, 'country'),
      ]);
      log("✅ Связи успешно обработаны.");

      // Статистика
      const newCount = upsertedAnimes.filter(a => !existingIdsSet.has(a.shikimori_id)).length;
      const updatedCount = upsertedAnimes.length - newCount;
      totalNew += newCount;
      totalUpdated += updatedCount;
      
      currentPageUrl = data.next_page;
      if (!currentPageUrl) log("🏁 Достигнут конец списка Kodik API.");
      await new Promise(resolve => setTimeout(resolve, 1000));
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
