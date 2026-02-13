import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { KodikAnimeData } from "@/lib/types";
import { processAllRelationsForAnime, transformToAnimeRecord } from "@/lib/parser-utils";

export const dynamic = "force-dynamic";

const KODIK_BASE_URL = "https://kodikapi.com/list";
const PAGE_LIMIT = 100;
const DEFAULT_LOOKBACK_HOURS = 24;
const SAFETY_WINDOW_MINUTES = 120;
const DEFAULT_MAX_PAGES = 30;

function isAuthorized(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true;

  const authHeader = request.headers.get("authorization");
  const xCronSecret = request.headers.get("x-cron-secret");

  return authHeader === `Bearer ${cronSecret}` || xCronSecret === cronSecret;
}

function parseDate(value?: string | null) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "/api/parse-daily",
    message: "Use POST to run incremental Kodik synchronization",
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

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  const body = await request.json().catch(() => ({}));
  const maxPages = Math.min(Number(body.maxPages) || DEFAULT_MAX_PAGES, 100);
  const lookbackHours = Number(body.lookbackHours) || DEFAULT_LOOKBACK_HOURS;

  try {
    const { data: latestSavedAnime, error: latestSavedAnimeError } = await supabase
      .from("animes")
      .select("updated_at_kodik")
      .order("updated_at_kodik", { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle();

    if (latestSavedAnimeError) throw latestSavedAnimeError;

    const latestSavedDate = parseDate(latestSavedAnime?.updated_at_kodik);
    const fallbackDate = new Date(Date.now() - lookbackHours * 60 * 60 * 1000);

    const threshold = latestSavedDate ?? fallbackDate;
    threshold.setMinutes(threshold.getMinutes() - SAFETY_WINDOW_MINUTES);

    let nextPageUrl: string | null = null;
    let pagesScanned = 0;
    let reachedWatermark = false;

    const animeMap = new Map<string, KodikAnimeData>();

    while (pagesScanned < maxPages && !reachedWatermark) {
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
      const pageItems: KodikAnimeData[] = data.results || [];

      if (pageItems.length === 0) break;

      for (const anime of pageItems) {
        if (!anime.shikimori_id) continue;

        const animeUpdatedAt = parseDate(anime.updated_at);
        if (animeUpdatedAt && animeUpdatedAt < threshold) {
          reachedWatermark = true;
          continue;
        }

        const existing = animeMap.get(anime.shikimori_id);
        if (!existing) {
          animeMap.set(anime.shikimori_id, anime);
          continue;
        }

        const existingUpdatedAt = parseDate(existing.updated_at)?.getTime() || 0;
        const currentUpdatedAt = animeUpdatedAt?.getTime() || 0;
        if (currentUpdatedAt > existingUpdatedAt) {
          animeMap.set(anime.shikimori_id, anime);
        }
      }

      pagesScanned += 1;
      nextPageUrl = data.next_page || null;

      if (!nextPageUrl) break;
    }

    const uniqueAnimeList = Array.from(animeMap.values());
    if (uniqueAnimeList.length === 0) {
      return NextResponse.json({
        message: "No new updates found",
        processed: 0,
        pagesScanned,
        threshold: threshold.toISOString(),
      });
    }

    const animeRecordsToUpsert = uniqueAnimeList.map(transformToAnimeRecord);

    const { data: upsertedAnimes, error: animeError } = await supabase
      .from("animes")
      .upsert(animeRecordsToUpsert, { onConflict: "shikimori_id" })
      .select("id, shikimori_id");

    if (animeError) throw animeError;
    if (!upsertedAnimes?.length) {
      return NextResponse.json({ message: "No rows upserted", processed: 0, pagesScanned });
    }

    const animeIdMap = new Map(upsertedAnimes.map((anime) => [anime.shikimori_id, anime.id]));

    for (const anime of uniqueAnimeList) {
      const animeId = animeIdMap.get(anime.shikimori_id!);
      if (!animeId) continue;
      await processAllRelationsForAnime(supabase, anime, animeId);
    }

    return NextResponse.json({
      message: "Incremental sync completed",
      processed: upsertedAnimes.length,
      pagesScanned,
      threshold: threshold.toISOString(),
      reachedWatermark,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Daily parser error:", error);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
