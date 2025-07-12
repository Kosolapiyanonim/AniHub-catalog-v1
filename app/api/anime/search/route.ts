import { NextResponse } from "next/server"

const KODIK_API_URL = "https://kodikapi.com"
const API_TOKEN = process.env.KODIK_API_TOKEN

interface AnimeResult {
  id: string
  type: string
  title: string
  title_orig: string
  other_title: string
  translation: {
    id: number
    title: string
    type: string
  }
  year: number
  material_data: {
    shikimori_id?: string
    kinopoisk_id?: string
    title: string
    anime_title: string
    poster_url: string
    anime_poster_url: string
    description: string
    anime_description: string
    kinopoisk_rating?: number
    shikimori_rating?: number
    anime_genres: string[]
    episodes_total?: number
    anime_status: string
    year: number
  }
  quality: string
  screenshots: string[]
  link: string
}

interface GroupedAnime {
  id: string // Используем первый найденный Kodik ID
  title: string
  title_orig: string
  other_title: string
  year: number
  poster_url: string
  description: string
  rating: number
  genres: string[]
  episodes_total?: number
  status: string
  translations: Array<{
    id: string
    title: string
    type: string
    quality: string
    link: string
  }>
  screenshots: string[]
}

function groupAnimeByUniqueId(results: AnimeResult[]): GroupedAnime[] {
  const grouped = new Map<string, GroupedAnime>()

  results.forEach((anime) => {
    const uniqueId =
      anime.material_data?.shikimori_id ||
      anime.material_data?.kinopoisk_id ||
      anime.material_data?.title ||
      anime.title

    if (!grouped.has(uniqueId)) {
      grouped.set(uniqueId, {
        id: anime.id, // Используем первый Kodik ID для ссылки
        title: anime.material_data?.anime_title || anime.title,
        title_orig: anime.title_orig,
        other_title: anime.other_title,
        year: anime.material_data?.year || anime.year,
        poster_url:
          anime.material_data?.anime_poster_url ||
          anime.material_data?.poster_url ||
          "/placeholder.svg?height=400&width=300",
        description: anime.material_data?.anime_description || anime.material_data?.description || "",
        rating: anime.material_data?.shikimori_rating || anime.material_data?.kinopoisk_rating || 0,
        genres: anime.material_data?.anime_genres || [],
        episodes_total: anime.material_data?.episodes_total,
        status: anime.material_data?.anime_status || "unknown",
        translations: [],
        screenshots: anime.screenshots || [],
      })
    }

    const groupedAnime = grouped.get(uniqueId)!
    groupedAnime.translations.push({
      id: anime.id,
      title: anime.translation.title,
      type: anime.translation.type,
      quality: anime.quality,
      link: anime.link,
    })
  })

  return Array.from(grouped.values())
}

export async function GET(request: Request) {
  console.log("🔍 Search API called, token exists:", !!API_TOKEN)

  if (!API_TOKEN) {
    console.error("❌ KODIK_API_TOKEN not found in environment variables")
    return NextResponse.json({ error: "API token not configured" }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
  }

  const apiUrl = `${KODIK_API_URL}/search?token=${API_TOKEN}&title=${encodeURIComponent(query)}&types=anime,anime-serial&with_material_data=true&limit=100`
  console.log("🔍 Searching for:", query)

  try {
    const response = await fetch(apiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; AnimeBot/1.0)",
      },
    })

    console.log("📡 Kodik search API response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Kodik search API error:", response.status, errorText)
      throw new Error(`Kodik API returned ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    console.log("✅ Kodik search API success, results count:", data.results?.length || 0)

    // Группируем результаты по уникальному ID аниме
    const groupedResults = groupAnimeByUniqueId(data.results || [])
    console.log("🔄 Grouped search results count:", groupedResults.length)

    return NextResponse.json({
      results: groupedResults,
      total: groupedResults.length,
      time: data.time || null,
    })
  } catch (error) {
    console.error("❌ Error searching anime:", error)
    return NextResponse.json(
      {
        error: "Failed to search anime",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
