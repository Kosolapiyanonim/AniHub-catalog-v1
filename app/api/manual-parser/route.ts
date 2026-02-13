import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { KodikAnimeData } from "@/lib/types";
import { processAllRelationsForAnime, transformToAnimeRecord } from "@/lib/parser-utils";

export const dynamic = "force-dynamic";

type PeriodKey = "24h" | "7d" | "30d" | "180d";

const PERIOD_TO_HOURS: Record<PeriodKey, number> = {
  "24h": 24,
  "7d": 24 * 7,
  "30d": 24 * 30,
  "180d": 24 * 180,
};

const KODIK_BASE_URL = "https://kodikapi.com/list";
const PAGE_LIMIT = 100;
const DEFAULT_MAX_PAGES = 100;

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
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  let nextPageUrl: string | null = null;
  let pagesScanned = 0;
  let totalFetched = 0;
  let skippedWithoutShikimori = 0;
  let reachedThreshold = false;

  const animeMap = new Map<string, KodikAnimeData>();

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

      const response: Response = await fetch(targetUrl);
      if (!response.ok) {
        throw new Error(`Kodik API error ${response.status}`);
      }

      const data: { results?: KodikAnimeData[]; next_page?: string | null } = await response.json();
      const pageItems = data.results || [];
      totalFetched += pageItems.length;
      pagesScanned += 1;

      logs.push(`Страница ${pagesScanned}: ${pageItems.length} материалов`);

      if (pageItems.length === 0) break;

      for (const anime of pageItems) {
        if (!anime.shikimori_id) {
          skippedWithoutShikimori += 1;
          continue;
        }

        const updatedAt = parseDate(anime.updated_at);
        if (updatedAt && updatedAt < threshold) {
          reachedThreshold = true;
          continue;
        }

        const existing = animeMap.get(anime.shikimori_id);
        if (!existing) {
          animeMap.set(anime.shikimori_id, anime);
        } else {
          const existingTs = parseDate(existing.updated_at)?.getTime() || 0;
          const currentTs = updatedAt?.getTime() || 0;
          if (currentTs > existingTs) {
            animeMap.set(anime.shikimori_id, anime);
          }
        }

        if (singleAnimeDebug && animeMap.size >= 1) {
          reachedThreshold = true;
          break;
        }
      }

      nextPageUrl = data.next_page || null;
      if (!nextPageUrl) break;
    }

    const uniqueAnimeList = Array.from(animeMap.values());

    if (dryRun) {
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
      return NextResponse.json({
        message: "No updates in selected period",
        period,
        threshold: threshold.toISOString(),
        pagesScanned,
        totalFetched,
        processed: 0,
        skippedWithoutShikimori,
        logs,
      });
    }

    const animeRecordsToUpsert = uniqueAnimeList.map(transformToAnimeRecord);

    const { data: upsertedAnimes, error: animeError } = await supabase
      .from("animes")
      .upsert(animeRecordsToUpsert, { onConflict: "shikimori_id" })
      .select("id, shikimori_id");

    if (animeError) throw animeError;

    const idMap = new Map((upsertedAnimes || []).map((row) => [row.shikimori_id, row.id]));

    for (const anime of uniqueAnimeList) {
      const animeId = idMap.get(anime.shikimori_id!);
      if (!animeId) continue;
      await processAllRelationsForAnime(supabase, anime, animeId);
    }

    return NextResponse.json({
      message: "Manual parsing completed",
      period,
      threshold: threshold.toISOString(),
      pagesScanned,
      totalFetched,
      processed: upsertedAnimes?.length || 0,
      uniqueCandidates: uniqueAnimeList.length,
      skippedWithoutShikimori,
      singleAnimeDebug,
      logs,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
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
