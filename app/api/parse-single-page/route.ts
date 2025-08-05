// /app/api/parser/route.ts (или /app/api/parse-single-page/route.ts)

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { KodikAnimeData } from "@/lib/types"
import {
  transformToAnimeRecord,
  processAllRelationsForAnime,
  parseSingleAnimePage,
  parseAndSaveAnime,
} from "@/lib/parser-utils"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = Number.parseInt(searchParams.get("page") || "1")

  try {
    const success = await parseAndSaveAnime(page)

    if (success) {
      return NextResponse.json({
        message: `Successfully parsed and saved anime from page ${page}`,
      })
    } else {
      return NextResponse.json({ error: `Failed to parse or save anime from page ${page}` }, { status: 500 })
    }
  } catch (error) {
    console.error("Error during parsing:", error)
    return NextResponse.json({ error: "An unexpected error occurred during parsing" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const KODIK_TOKEN = process.env.KODIK_API_TOKEN
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!KODIK_TOKEN || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      throw new Error("Одна или несколько переменных окружения не настроены на сервере.")
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    const { url } = await request.json()
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }
    console.log(`Starting parsing single page: ${url}`)
    const result = await parseSingleAnimePage(url)
    console.log("Finished parsing single page.")

    const animeList: KodikAnimeData[] = (result.results || []).filter((anime: any) => anime.shikimori_id)

    if (animeList.length === 0) {
      return NextResponse.json({
        message: "На странице не найдено аниме с shikimori_id.",
        processed: 0,
        nextPageUrl: result.next_page || null,
      })
    }

    const uniqueAnimeMap = new Map<string, KodikAnimeData>()
    animeList.forEach((anime) => {
      if (anime.shikimori_id && !uniqueAnimeMap.has(anime.shikimori_id)) {
        uniqueAnimeMap.set(anime.shikimori_id, anime)
      }
    })
    const uniqueAnimeList = Array.from(uniqueAnimeMap.values())

    // ИЗМЕНЕНИЕ: Теперь мы обрабатываем трансформацию асинхронно
    const animeRecordsToUpsert = await Promise.all(uniqueAnimeList.map((anime) => transformToAnimeRecord(anime)))

    const { data: upsertedAnimes, error: animeError } = await supabase
      .from("animes")
      .upsert(animeRecordsToUpsert, { onConflict: "shikimori_id" })
      .select("id, shikimori_id")

    if (animeError) throw animeError
    if (!upsertedAnimes)
      return NextResponse.json({
        message: "Нет данных для обновления",
        processed: 0,
        nextPageUrl: result.next_page || null,
      })

    const animeIdMap = new Map(upsertedAnimes.map((a) => [a.shikimori_id, a.id]))

    for (const anime of uniqueAnimeList) {
      const animeId = animeIdMap.get(anime.shikimori_id!)
      if (animeId) {
        await processAllRelationsForAnime(supabase, anime, animeId)
      }
    }

    const allTranslations = animeList
      .map((anime) => {
        const anime_id = animeIdMap.get(anime.shikimori_id!)
        if (!anime_id) return null
        return {
          anime_id,
          kodik_id: anime.id,
          title: anime.translation.title,
          type: anime.translation.type,
          quality: anime.quality,
          player_link: anime.link,
        }
      })
      .filter(Boolean) as any[]

    if (allTranslations.length > 0) {
      await supabase.from("translations").upsert(allTranslations, { onConflict: "kodik_id" })
    }

    return NextResponse.json({
      message: `Обогащено и сохранено: ${uniqueAnimeList.length} уникальных аниме.`,
      processed: uniqueAnimeList.length,
      nextPageUrl: result.next_page || null,
    })
  } catch (err: any) {
    console.error("--- [PARSER_ERROR] ---", err.message)
    return NextResponse.json({ error: "Произошла критическая ошибка. См. логи Vercel." }, { status: 500 })
  }
}
