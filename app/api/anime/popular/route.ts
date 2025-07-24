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
    shikimori_votes?: number
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
  id: string
  title: string
  title_orig: string
  other_title: string
  year: number
  poster_url: string
  description: string
  rating: number
  shikimori_votes: number
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
        id: anime.id,
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
        shikimori_votes: anime.material_data?.shikimori_votes || 0,
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
  console.log("🎬 Popular API called")
  console.log("🔑 Token exists:", !!API_TOKEN)

  if (!API_TOKEN) {
    console.error("❌ KODIK_API_TOKEN not found in environment variables")
    return NextResponse.json(
      {
        error: "API token not configured",
        environment: process.env.NODE_ENV,
        hasToken: !!API_TOKEN,
      },
      { status: 500 },
    )
  }

  const { searchParams } = new URL(request.url)
  const limit = searchParams.get("limit") || "100" // Увеличиваем лимит для лучшей фильтрации
  const sort = searchParams.get("sort") || "rating"

  // Определяем параметры сортировки для Kodik API
  let sortParam = "shikimori_votes"
  let orderParam = "desc"

  switch (sort) {
    case "rating":
      // Топ рейтинг: сортируем по количеству голосов Shikimori (популярность)
      sortParam = "shikimori_votes"
      orderParam = "desc"
      break
    case "year":
      sortParam = "year"
      orderParam = "desc"
      break
    case "trending":
      // Для трендинга используем рейтинг Shikimori
      sortParam = "shikimori_rating"
      orderParam = "desc"
      break
    default:
      sortParam = "shikimori_votes"
      orderParam = "desc"
  }

  const apiUrl = `${KODIK_API_URL}/list?token=${API_TOKEN}&types=anime,anime-serial&limit=${limit}&sort=${sortParam}&order=${orderParam}&with_material_data=true`
  console.log("🔗 Fetching popular anime with sort:", sort, "param:", sortParam)

  try {
    const response = await fetch(apiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; AnimeBot/1.0)",
      },
    })

    console.log("📡 Kodik API response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Kodik API error:", response.status, errorText)
      throw new Error(`Kodik API returned ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    console.log("✅ Kodik API success, results count:", data.results?.length || 0)

    const groupedResults = groupAnimeByUniqueId(data.results || [])
    console.log("🔄 Grouped results count:", groupedResults.length)

    // Логирование для трендинга
    if (sort === "trending") {
      const currentYear = new Date().getFullYear() // Теперь это 2025
      const recentAnime = groupedResults.filter((a) => a.year >= currentYear - 1) // 2024-2025 годы
      console.log(`📅 Recent anime (${currentYear - 1}-${currentYear}):`, recentAnime.length)
      console.log(
        "🔥 Sample recent anime:",
        recentAnime.slice(0, 3).map((a) => ({
          title: a.title,
          year: a.year,
          rating: a.rating,
          votes: a.shikimori_votes,
        })),
      )
    }

    // Дополнительная сортировка после группировки
    let sortedResults = groupedResults
    switch (sort) {
      case "rating":
        // Топ рейтинг: сначала по количеству голосов, потом по рейтингу
        sortedResults = groupedResults
          .filter((anime) => anime.shikimori_votes > 1000) // Фильтруем аниме с достаточным количеством голосов
          .sort((a, b) => {
            // Сначала по количеству голосов (популярность)
            if (b.shikimori_votes !== a.shikimori_votes) {
              return b.shikimori_votes - a.shikimori_votes
            }
            // Потом по рейтингу
            return b.rating - a.rating
          })
        break
      case "year":
        sortedResults = groupedResults.sort((a, b) => b.year - a.year)
        break
      case "trending":
        // Трендинг: учитываем свежие аниме с меньшим количеством голосов
        sortedResults = groupedResults
          .filter((anime) => {
            const currentYear = new Date().getFullYear()

            const isRecent = anime.year >= currentYear - 1 // Последние 2 года
            const isQuality = anime.rating > 6.5 // Минимальное качество

            // Для свежих аниме (последние 2 года) - более мягкие требования
            if (isRecent) {
              return isQuality && anime.shikimori_votes > 100 // Всего 100+ голосов для новых
            }

            // Для старых аниме - стандартные требования
            return isQuality && anime.shikimori_votes > 1000
          })
          .sort((a, b) => {
            const currentYear = new Date().getFullYear()

            // Бонус за свежесть (чем новее, тем больше бонус)
            const freshnessBonus = (anime: any) => {
              const age = currentYear - anime.year
              if (age === 0) return 2.5 // 2025 год - максимальный бонус!
              if (age === 1) return 2.0 // 2024 год - тоже очень свежий
              if (age === 2) return 1.5 // 2023 год
              if (age <= 4) return 1.2 // 2021-2022 года
              return 1.0 // Старые аниме без бонуса
            }

            // Нормализация голосов (логарифм для сглаживания)
            const normalizeVotes = (votes: number) => Math.log10(Math.max(votes, 1))

            // Комбинированный скор с учетом свежести
            const scoreA =
              a.rating * 0.4 + // Рейтинг (40%)
              normalizeVotes(a.shikimori_votes) * 0.3 + // Голоса (30%)
              freshnessBonus(a) * 0.3 // Свежесть (30%)

            const scoreB = b.rating * 0.4 + normalizeVotes(b.shikimori_votes) * 0.3 + freshnessBonus(b) * 0.3

            return scoreB - scoreA
          })
        break
    }

    const finalResults = sortedResults.slice(0, Number.parseInt(searchParams.get("limit") || "20"))

    console.log(
      "📊 Final results sample:",
      finalResults.slice(0, 3).map((a) => ({
        title: a.title,
        rating: a.rating,
        votes: a.shikimori_votes,
        year: a.year,
      })),
    )

    return NextResponse.json({
      results: finalResults,
      total: finalResults.length,
      sort: sort,
      time: data.time || null,
    })
  } catch (error) {
    console.error("❌ Error fetching popular anime:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch anime",
        details: error instanceof Error ? error.message : "Unknown error",
        environment: process.env.NODE_ENV,
      },
      { status: 500 },
    )
  }
}
