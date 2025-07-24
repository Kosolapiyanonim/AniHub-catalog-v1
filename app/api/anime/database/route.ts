import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = Number.parseInt(searchParams.get("limit") || "20")
  const offset = Number.parseInt(searchParams.get("offset") || "0")
  const sort = searchParams.get("sort") || "shikimori_rating"
  const order = searchParams.get("order") || "desc"

  console.log("🗄️ Database API called:", { limit, offset, sort, order })

  try {
    // Запрос аниме с жанрами
    const {
      data: animes,
      error,
      count,
    } = await supabase
      .from("animes")
      .select("*", { count: "exact" })
      .order(sort, { ascending: order === "asc" })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error("❌ Supabase error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("✅ Database query success:", animes?.length || 0, "results")

    // Группируем жанры, студии и страны для каждого аниме
    const processedAnimes =
      animes?.map((anime) => ({
        id: anime.kodik_id,
        title: anime.title,
        title_orig: anime.title_orig,
        year: anime.year,
        poster_url: anime.poster_url,
        description: anime.description,
        rating: anime.shikimori_rating || anime.kinopoisk_rating || 0,
        shikimori_votes: anime.shikimori_votes || 0,
        genres: [], // ← временно пусто
        studios: [], // ← временно пусто
        countries: [], // ← временно пусто
        episodes_total: anime.episodes_count,
        status: anime.status,
        translations: [
          {
            id: anime.kodik_id,
            title: "Основная озвучка",
            type: "voice",
            quality: "HD",
            link: anime.player_link,
          },
        ],
        screenshots: anime.screenshots?.screenshots || [],
      })) || []

    return NextResponse.json({
      results: processedAnimes,
      total: count || 0,
      limit,
      offset,
    })
  } catch (error) {
    console.error("❌ Database API error:", error)
    return NextResponse.json({ error: "Failed to fetch from database" }, { status: 500 })
  }
}
