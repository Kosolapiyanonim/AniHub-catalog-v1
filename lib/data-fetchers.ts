import { createClient } from "./supabase/server"
import type { Anime, AnimeDetails, HomepageSections } from "./types"

export async function getCatalogAnime(searchParams: { [key: string]: string | string[] | undefined }): Promise<{
  animes: Anime[]
  totalPages: number
}> {
  const supabase = await createClient()
  const page = Number.parseInt((searchParams.page as string) || "1")
  const limit = 20
  const offset = (page - 1) * limit

  let query = supabase
    .from("animes")
    .select("*", { count: "exact" })
    .range(offset, offset + limit - 1)

  if (searchParams.genre) {
    query = query.contains("genres", [searchParams.genre])
  }
  if (searchParams.status) {
    query = query.eq("status", searchParams.status)
  }
  if (searchParams.year) {
    query = query.eq("year", searchParams.year)
  }
  if (searchParams.type) {
    query = query.eq("type", searchParams.type)
  }
  if (searchParams.search) {
    query = query.ilike("title", `%${searchParams.search}%`)
  }

  const { data, count, error } = await query

  if (error) {
    console.error("Error fetching catalog:", error)
    return { animes: [], totalPages: 0 }
  }

  const animes = (data || []).map(transformDbAnime)
  const totalPages = Math.ceil((count || 0) / limit)

  return { animes, totalPages }
}

export async function getAnimeById(id: string): Promise<AnimeDetails | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("animes").select("*").eq("shikimori_id", id).single()

  if (error || !data) return null

  return {
    ...transformDbAnime(data),
    seasons: {},
    player_link: data.player_link || "",
  }
}

export async function getSearchResults(query: string): Promise<Anime[]> {
  if (!query) return []

  const supabase = await createClient()
  const { data, error } = await supabase.from("animes").select("*").ilike("title", `%${query}%`).limit(10)

  if (error) return []
  return (data || []).map(transformDbAnime)
}

export async function getHomepageSections(): Promise<HomepageSections> {
  const supabase = await createClient()

  try {
    const [heroResult, trendingResult, popularResult, latestResult] = await Promise.all([
      supabase
        .from("animes")
        .select("*")
        .eq("status", "ongoing")
        .gte("shikimori_rating", 7)
        .order("shikimori_rating", { ascending: false })
        .limit(5),
      supabase
        .from("animes")
        .select("*")
        .gte("shikimori_rating", 7)
        .order("shikimori_rating", { ascending: false })
        .limit(10),
      supabase.from("animes").select("*").order("shikimori_votes", { ascending: false }).limit(10),
      supabase.from("animes").select("*").order("updated_at_kodik", { ascending: false }).limit(10),
    ])

    return {
      hero: (heroResult.data || []).map(transformDbAnime),
      trending: (trendingResult.data || []).map(transformDbAnime),
      popular: (popularResult.data || []).map(transformDbAnime),
      latestUpdates: (latestResult.data || []).map(transformDbAnime),
    }
  } catch (error) {
    console.error("Error fetching homepage sections:", error)
    return { hero: [], trending: [], popular: [], latestUpdates: [] }
  }
}

export async function getPopularAnime(): Promise<Anime[]> {
  const supabase = await createClient()
  const { data } = await supabase.from("animes").select("*").order("shikimori_votes", { ascending: false }).limit(20)

  return (data || []).map(transformDbAnime)
}

export async function getGenres(): Promise<string[]> {
  const supabase = await createClient()
  const { data } = await supabase.from("genres").select("name")
  return (data || []).map((g) => g.name)
}

export async function getStatuses(): Promise<string[]> {
  return ["ongoing", "released", "anons"]
}

export async function getStudios(): Promise<string[]> {
  const supabase = await createClient()
  const { data } = await supabase.from("studios").select("name")
  return (data || []).map((s) => s.name)
}

export async function getTypes(): Promise<string[]> {
  return ["tv", "movie", "ova", "ona", "special", "tv_special"]
}

export async function getYears(): Promise<number[]> {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 30 }, (_, i) => currentYear - i)
}

function transformDbAnime(record: any): Anime {
  return {
    id: record.shikimori_id || record.id,
    title: {
      ru: record.title || "",
      en: record.title_orig || record.title || "",
    },
    poster: record.poster_url || "/placeholder.jpg",
    description: record.description || "",
    genres: record.genres || [],
    year: record.year,
    rating: record.shikimori_rating,
    episodes: record.episodes_count,
    status: record.status,
    type: record.type,
    minimal_age: record.rating_mpaa ? Number.parseInt(record.rating_mpaa) || null : null,
    shikimori_id: record.shikimori_id ? Number.parseInt(record.shikimori_id) : null,
    screenshots: record.screenshots?.screenshots || [],
  }
}
