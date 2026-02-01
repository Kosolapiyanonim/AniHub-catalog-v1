// /app/api/full-parser/route.ts
// Полный парсер с правильной схемой связей

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { KodikAnimeData } from "@/lib/types";
import { normalizeShikimoriImageUrl } from "@/lib/normalizeShikimoriImageUrl";

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 минут для Vercel Pro

/**
 * Обрабатывает один тип связей пакетом
 */
async function processRelationsBatch(
  supabase: any,
  relationData: { anime_id: number; name: string }[],
  relation_type: "genre" | "studio" | "country"
) {
  if (!relationData || relationData.length === 0) return;

  const tableName = relation_type === "country" ? "countries" : `${relation_type}s`;
  const idFieldName = `${relation_type}_id`;
  const relationTableName = `anime_${tableName}`;

  // 1. Получаем уникальные имена и добавляем их в справочник
  const uniqueNames = [...new Set(relationData.map(r => r.name))];
  const { data: existingItems, error: upsertError } = await supabase
    .from(tableName)
    .upsert(uniqueNames.map(name => ({ name })), { onConflict: 'name' })
    .select('id, name');

  if (upsertError) throw upsertError;
  if (!existingItems) return;

  // 2. Создаем карту "имя -> id"
  const itemMap = new Map(existingItems.map((item: any) => [item.name, item.id]));

  // 3. Формируем записи для таблицы связей
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
    const { error: relationError } = await supabase
      .from(relationTableName)
      .upsert(relationsToUpsert, { onConflict: `anime_id,${idFieldName}` });
    
    if (relationError) console.error(`Ошибка при вставке в ${relationTableName}:`, relationError);
  }
}

export async function POST(request: Request) {
  const output: string[] = [];
  const log = (message: string) => {
    console.log(message);
    output.push(message);
  };

  try {
    log("🚀 Запуск ПОЛНОЙ синхронизации базы данных...");
    
    const KODIK_TOKEN = process.env.KODIK_API_TOKEN;
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!KODIK_TOKEN || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      throw new Error("Переменные окружения не настроены (KODIK_API_TOKEN, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    // Читаем параметры из тела запроса
    const body = await request.json().catch(() => ({}));
    const maxPages = body.maxPages || 10; // По умолчанию 10 страниц
    
    let currentPageUrl: string | null = "https://kodikapi.com/list";
    let pagesParsed = 0;
    let totalProcessed = 0;
    
    while (currentPageUrl && pagesParsed < maxPages) {
      pagesParsed++;
      log("-".repeat(50));
      log(`🌊 Волна №${pagesParsed}/${maxPages}. Запрос к Kodik...`);

      const targetUrl = new URL(currentPageUrl);
      targetUrl.searchParams.set("token", KODIK_TOKEN);
      targetUrl.searchParams.set("limit", "100");
      targetUrl.searchParams.set("types", "anime,anime-serial");
      targetUrl.searchParams.set("with_material_data", "true");

      const response = await fetch(targetUrl);
      
      if (!response.ok) {
        log(`❗️ Ошибка от Kodik API на странице ${pagesParsed}, пропускаем...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        currentPageUrl = null;
        continue;
      }

      const data = await response.json();
      const animeList: KodikAnimeData[] = data.results || [];
      log(`🔄 Получено ${animeList.length} записей для обработки.`);

      if (animeList.length === 0) {
        currentPageUrl = data.next_page;
        continue;
      }

      // 1. Отбираем уникальные аниме по shikimori_id
      const uniqueAnimeMap = new Map<string, KodikAnimeData>();
      animeList.forEach(anime => {
        if (anime.shikimori_id && !uniqueAnimeMap.has(anime.shikimori_id)) {
          uniqueAnimeMap.set(anime.shikimori_id, anime);
        }
      });
      const uniqueAnimeList = Array.from(uniqueAnimeMap.values());

      // 2. Формируем записи для upsert
      const recordsToUpsert = uniqueAnimeList.map(anime => {
        const material = anime.material_data || {};
        const poster = material.anime_poster_url || material.poster_url || null;
        // Нормализуем poster_url: если normalize вернул null, но исходное значение было, оставляем исходное
        const normalizedPoster = normalizeShikimoriImageUrl(poster) ?? poster ?? null;
        return {
          shikimori_id: anime.shikimori_id,
          kinopoisk_id: anime.kinopoisk_id,
          title: material.anime_title || anime.title,
          title_orig: anime.title_orig,
          year: anime.year,
          poster_url: normalizedPoster,
          description: material.anime_description || material.description || "Описание отсутствует.",
          type: anime.type,
          anime_kind: material.anime_kind,
          status: material.anime_status,
          episodes_count: anime.episodes_count || 0,
          episodes_total: material.episodes_total || anime.episodes_count || 0,
          episodes_aired: anime.last_episode || 0,
          rating_mpaa: material.rating_mpaa,
          kinopoisk_rating: material.kinopoisk_rating,
          imdb_rating: material.imdb_rating,
          shikimori_rating: material.shikimori_rating,
          kinopoisk_votes: material.kinopoisk_votes,
          shikimori_votes: material.shikimori_votes,
          screenshots: anime.screenshots || [],
          updated_at_kodik: anime.updated_at,
        };
      });

      // 3. Upsert основных записей
      const { data: upsertedAnimes, error: upsertError } = await supabase
        .from('animes')
        .upsert(recordsToUpsert, { onConflict: 'shikimori_id' })
        .select('id, shikimori_id');

      if (upsertError) {
        log(`❌ Ошибка сохранения: ${upsertError.message}`);
        continue;
      }

      if (!upsertedAnimes || upsertedAnimes.length === 0) {
        log("❗️ Не удалось получить ID после вставки.");
        continue;
      }

      log(`💾 Сохранено ${upsertedAnimes.length} основных записей.`);
      totalProcessed += upsertedAnimes.length;

      // 4. Собираем связи
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

      // 5. Обрабатываем связи пакетами
      log(`⚙️ Связи: ${allGenres.length} жанров, ${allStudios.length} студий, ${allCountries.length} стран...`);
      await Promise.all([
        processRelationsBatch(supabase, allGenres, 'genre'),
        processRelationsBatch(supabase, allStudios, 'studio'),
        processRelationsBatch(supabase, allCountries, 'country'),
      ]);

      // 6. Сохраняем озвучки
      const allTranslations = animeList
        .map(anime => {
          const anime_id = animeIdMap.get(anime.shikimori_id!);
          if (!anime_id || !anime.translation) return null;
          return {
            anime_id,
            kodik_translation_id: anime.translation.id,
            title: anime.translation.title,
            type: anime.translation.type,
            quality: anime.quality,
            player_link: anime.link.startsWith('//') ? `https:${anime.link}` : anime.link,
          };
        })
        .filter(Boolean) as any[];

      if (allTranslations.length > 0) {
        const { error: translationError } = await supabase
          .from('translations')
          .upsert(allTranslations, { onConflict: 'anime_id,kodik_translation_id' });
        
        if (translationError) {
          log(`⚠️ Ошибка сохранения озвучек: ${translationError.message}`);
        } else {
          log(`🎙️ Сохранено ${allTranslations.length} озвучек.`);
        }
      }

      log("✅ Страница обработана.");
      
      currentPageUrl = data.next_page;
      if (!currentPageUrl) log("🏁 Достигнут конец списка Kodik API.");
      
      // Пауза между запросами
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    log("=".repeat(50));
    log(`🎉 Синхронизация завершена!`);
    log(`📊 Обработано страниц: ${pagesParsed}, записей: ${totalProcessed}.`);
    
    return NextResponse.json({ 
      status: 'success', 
      pagesParsed, 
      totalProcessed,
      output: output.join('\n') 
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : "Неизвестная ошибка";
    log(`❌ Критическая ошибка: ${message}`);
    return NextResponse.json({ status: 'error', message, output: output.join('\n') }, { status: 500 });
  }
}
