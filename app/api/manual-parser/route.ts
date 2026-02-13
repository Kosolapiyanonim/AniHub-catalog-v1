import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { KodikAnimeData } from "@/lib/types";
import { processAllRelationsForAnime, transformToAnimeRecord } from "@/lib/parser-utils";

export const dynamic = "force-dynamic";

type PeriodKey = "24h" | "7d" | "30d" | "180d";

type AnimeDbSnapshot = {
  id: number;
  shikimori_id: string;
  title: string | null;
  status: string | null;
  episodes_aired: number | null;
  episodes_total: number | null;
  updated_at_kodik: string | null;
};

type AnimeChange = {
  shikimori_id: string;
  title: string;
  action: "inserted" | "updated" | "unchanged";
  changedFields: string[];
};

const PERIOD_TO_HOURS: Record<PeriodKey, number> = {
  "24h": 24,
  "7d": 24 * 7,
  "30d": 24 * 30,
  "180d": 24 * 180,
};

const KODIK_BASE_URL = "https://kodikapi.com/list";
const PAGE_LIMIT = 100;
const DEFAULT_MAX_PAGES = 100;
const DB_CHUNK_SIZE = 300;
const MAX_CHANGE_LOG_ITEMS = 300;

function isAuthorized(request: Request) {
  const parserSecret = process.env.PARSER_MANUAL_SECRET ?? process.env.CRON_SECRET;
  if (!parserSecret) return true;

  const authHeader = request.headers.get("authorization");
  const xParserSecret = request.headers.get("x-parser-secret");
  return authHeader === `Bearer ${parserSecret}` || xParserSecret === parserSecret;
}

function parseDate(value?: string | null) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function getThreshold(period: PeriodKey) {
  const hours = PERIOD_TO_HOURS[period];
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

function chunk<T>(array: T[], size: number) {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

function getChangedFields(before: AnimeDbSnapshot | undefined, after: ReturnType<typeof transformToAnimeRecord>) {
  if (!before) return ["new_record"];

  const changedFields: string[] = [];

  if ((before.title || null) !== (after.title || null)) changedFields.push("title");
  if ((before.status || null) !== (after.status || null)) changedFields.push("status");
  if ((before.episodes_aired || 0) !== (after.episodes_aired || 0)) changedFields.push("episodes_aired");
  if ((before.episodes_total || 0) !== (after.episodes_total || 0)) changedFields.push("episodes_total");

  const beforeUpdatedTs = parseDate(before.updated_at_kodik)?.getTime() || 0;
  const afterUpdatedTs = parseDate(after.updated_at_kodik)?.getTime() || 0;
  if (beforeUpdatedTs !== afterUpdatedTs) changedFields.push("updated_at_kodik");

  return changedFields;
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "/api/manual-parser",
    supportedPeriods: Object.keys(PERIOD_TO_HOURS),
    bodyExample: {
      period: "24h",
      dryRun: false,
      singleAnimeDebug: false,
      maxPages: 100,
    },
  });
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const KODIK_TOKEN = process.env.KODIK_API_TOKEN;
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!KODIK_TOKEN || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return NextResponse.json(
      { error: "Missing KODIK_API_TOKEN, NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" },
      { status: 500 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const period = body.period as PeriodKey;
  const dryRun = Boolean(body.dryRun);
  const singleAnimeDebug = Boolean(body.singleAnimeDebug);
  const maxPages = Math.max(1, Math.min(Number(body.maxPages) || DEFAULT_MAX_PAGES, 500));

  if (!period || !(period in PERIOD_TO_HOURS)) {
    return NextResponse.json({ error: "Invalid period. Use one of: 24h, 7d, 30d, 180d" }, { status: 400 });
  }

  const threshold = getThreshold(period);
  const logs: string[] = [];
  const addLog = (stage: string, message: string) => {
    logs.push(`[${new Date().toISOString()}] [${stage}] ${message}`);
  };

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  let nextPageUrl: string | null = null;
  let pagesScanned = 0;
  let totalFetched = 0;
  let skippedWithoutShikimori = 0;
  let reachedThreshold = false;

  const animeMap = new Map<string, KodikAnimeData>();

  addLog("INIT", `Старт ручного парсинга. period=${period}, dryRun=${dryRun}, singleAnimeDebug=${singleAnimeDebug}, maxPages=${maxPages}`);
  addLog("INIT", `Порог даты: ${threshold.toISOString()}`);

  try {
    while (pagesScanned < maxPages && !reachedThreshold) {
      const targetUrl: URL = nextPageUrl ? new URL(nextPageUrl) : new URL(KODIK_BASE_URL);

      if (!nextPageUrl) {
        targetUrl.searchParams.set("token", KODIK_TOKEN);
        targetUrl.searchParams.set("types", "anime,anime-serial");
        targetUrl.searchParams.set("with_material_data", "true");
        targetUrl.searchParams.set("limit", String(PAGE_LIMIT));
        targetUrl.searchParams.set("sort", "updated_at");
        targetUrl.searchParams.set("order", "desc");
      }

      addLog("FETCH", `Запрос страницы ${pagesScanned + 1}: ${targetUrl.toString()}`);

      const response: Response = await fetch(targetUrl);
      if (!response.ok) {
        throw new Error(`Kodik API error ${response.status}`);
      }

      const data: { results?: KodikAnimeData[]; next_page?: string | null } = await response.json();
      const pageItems = data.results || [];
      totalFetched += pageItems.length;
      pagesScanned += 1;

      addLog("FETCH", `Страница ${pagesScanned} получена. Материалов: ${pageItems.length}`);

      if (pageItems.length === 0) {
        addLog("FETCH", "Пустая страница, завершаем обход.");
        break;
      }

      for (const anime of pageItems) {
        if (!anime.shikimori_id) {
          skippedWithoutShikimori += 1;
          addLog("FILTER", `Пропуск без shikimori_id: kodik_id=${anime.id}, title=${anime.title}`);
          continue;
        }

        const updatedAt = parseDate(anime.updated_at);
        if (updatedAt && updatedAt < threshold) {
          reachedThreshold = true;
          addLog("FILTER", `Достигнут порог даты на ${anime.title} (${anime.shikimori_id}), updated_at=${anime.updated_at}`);
          continue;
        }

        const existing = animeMap.get(anime.shikimori_id);
        if (!existing) {
          animeMap.set(anime.shikimori_id, anime);
          addLog("QUEUE", `Добавлено в очередь: ${anime.title} (${anime.shikimori_id}), updated_at=${anime.updated_at}`);
        } else {
          const existingTs = parseDate(existing.updated_at)?.getTime() || 0;
          const currentTs = updatedAt?.getTime() || 0;
          if (currentTs > existingTs) {
            animeMap.set(anime.shikimori_id, anime);
            addLog("QUEUE", `Обновлено в очереди по более свежей дате: ${anime.title} (${anime.shikimori_id})`);
          }
        }

        if (singleAnimeDebug && animeMap.size >= 1) {
          reachedThreshold = true;
          addLog("DEBUG", "singleAnimeDebug=true, остановка после первого аниме.");
          break;
        }
      }

      nextPageUrl = data.next_page || null;
      if (!nextPageUrl) {
        addLog("FETCH", "next_page отсутствует, обход завершён.");
        break;
      }
    }

    const uniqueAnimeList = Array.from(animeMap.values());
    addLog("SUMMARY", `Сканирование завершено: pagesScanned=${pagesScanned}, totalFetched=${totalFetched}, queued=${uniqueAnimeList.length}, skippedWithoutShikimori=${skippedWithoutShikimori}`);

    if (dryRun) {
      addLog("DRY_RUN", "Dry run режим — без записи в БД.");
      return NextResponse.json({
        message: "Dry run completed",
        period,
        threshold: threshold.toISOString(),
        pagesScanned,
        totalFetched,
        uniqueCandidates: uniqueAnimeList.length,
        skippedWithoutShikimori,
        singleAnimeDebug,
        logs,
      });
    }

    if (uniqueAnimeList.length === 0) {
      addLog("SUMMARY", "Нечего обновлять — список кандидатов пуст.");
      return NextResponse.json({
        message: "No updates in selected period",
        period,
        threshold: threshold.toISOString(),
        pagesScanned,
        totalFetched,
        processed: 0,
        inserted: 0,
        updated: 0,
        unchanged: 0,
        skippedWithoutShikimori,
        logs,
      });
    }

    const animeRecordsToUpsert = uniqueAnimeList.map(transformToAnimeRecord);
    addLog("DB", `Подготовлено к upsert: ${animeRecordsToUpsert.length} записей.`);

    const shikimoriIds = animeRecordsToUpsert.map((item) => item.shikimori_id).filter(Boolean) as string[];
    const existingMap = new Map<string, AnimeDbSnapshot>();

    for (const idsChunk of chunk(shikimoriIds, DB_CHUNK_SIZE)) {
      const { data: existingRows, error: existingError } = await supabase
        .from("animes")
        .select("id, shikimori_id, title, status, episodes_aired, episodes_total, updated_at_kodik")
        .in("shikimori_id", idsChunk);

      if (existingError) throw existingError;
      for (const row of (existingRows || []) as AnimeDbSnapshot[]) {
        existingMap.set(row.shikimori_id, row);
      }
    }

    addLog("DB", `Найдено существующих записей в БД: ${existingMap.size}`);

    const animeChanges: AnimeChange[] = animeRecordsToUpsert.map((record) => {
      const before = existingMap.get(record.shikimori_id);
      const changedFields = getChangedFields(before, record);
      const action: AnimeChange["action"] = !before ? "inserted" : changedFields.length > 0 ? "updated" : "unchanged";

      return {
        shikimori_id: record.shikimori_id,
        title: record.title,
        action,
        changedFields,
      };
    });

    const inserted = animeChanges.filter((item) => item.action === "inserted").length;
    const updated = animeChanges.filter((item) => item.action === "updated").length;
    const unchanged = animeChanges.filter((item) => item.action === "unchanged").length;

    addLog("DB", `Diff перед upsert: inserted=${inserted}, updated=${updated}, unchanged=${unchanged}`);

    animeChanges.slice(0, MAX_CHANGE_LOG_ITEMS).forEach((change, index) => {
      addLog(
        "DB_CHANGE",
        `${index + 1}/${animeChanges.length} ${change.action.toUpperCase()} ${change.title} (${change.shikimori_id}) fields=${change.changedFields.join(", ") || "none"}`,
      );
    });

    if (animeChanges.length > MAX_CHANGE_LOG_ITEMS) {
      addLog("DB_CHANGE", `Скрыто ${animeChanges.length - MAX_CHANGE_LOG_ITEMS} записей изменений (лимит логов).`);
    }

    const { data: upsertedAnimes, error: animeError } = await supabase
      .from("animes")
      .upsert(animeRecordsToUpsert, { onConflict: "shikimori_id" })
      .select("id, shikimori_id");

    if (animeError) throw animeError;

    const idMap = new Map((upsertedAnimes || []).map((row) => [row.shikimori_id, row.id]));
    addLog("DB", `Upsert завершён. Возвращено строк: ${upsertedAnimes?.length || 0}`);

    let relationsProcessed = 0;
    for (const anime of uniqueAnimeList) {
      const animeId = idMap.get(anime.shikimori_id!);
      if (!animeId) {
        addLog("RELATION", `Пропуск связей: не найден anime_id в БД для ${anime.title} (${anime.shikimori_id})`);
        continue;
      }

      addLog("RELATION", `Обновление связей: ${anime.title} (${anime.shikimori_id}) -> anime_id=${animeId}`);
      await processAllRelationsForAnime(supabase, anime, animeId);
      relationsProcessed += 1;
    }

    addLog("SUMMARY", `Готово. processed=${upsertedAnimes?.length || 0}, relationsProcessed=${relationsProcessed}`);

    return NextResponse.json({
      message: "Manual parsing completed",
      period,
      threshold: threshold.toISOString(),
      pagesScanned,
      totalFetched,
      processed: upsertedAnimes?.length || 0,
      inserted,
      updated,
      unchanged,
      uniqueCandidates: uniqueAnimeList.length,
      skippedWithoutShikimori,
      singleAnimeDebug,
      animeChanges,
      logs,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    addLog("ERROR", message);

    return NextResponse.json(
      {
        error: message,
        period,
        threshold: threshold.toISOString(),
        pagesScanned,
        totalFetched,
        uniqueCandidates: animeMap.size,
        skippedWithoutShikimori,
        logs,
      },
      { status: 500 },
    );
  }
}
