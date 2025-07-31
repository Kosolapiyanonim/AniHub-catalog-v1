import { createClient } from "@/lib/supabase/server"
import type { Anime, HomepageSection } from "@/lib/types"

export async function fetchHomepageSection(section: HomepageSection): Promise<Anime[]> {
  const supabase = createClient()

  let query = supabase
    .from("anime")
    .select(
      `
      id,
      name,
      description,
      poster,
      score,
      anime_genres(
        genres(
          id,
          name,
          slug
        )
      ),
      anime_kind
    `,
    )
    .limit(10) // Limit to 10 items for carousels

  if (section === "trending") {
    query = query.order("score", { ascending: false }) // Example: order by score for trending
  } else if (section === "popular") {
    query = query.order("views", { ascending: false }) // Example: order by views for popular
  } else if (section === "latestUpdates") {
    query = query.order("updated_at", { ascending: false }) // Example: order by updated_at for latest
  }

  const { data, error } = await query

  if (error) {
    console.error(`Error fetching ${section} section:`, error)
    return []
  }

  if (!data || data.length === 0) {
    console.warn(`No data found for ${section} section.`)
    return []
  }

  // Ensure anime_genres is an array of objects with a 'genres' property
  const formattedData = data.map((anime) => ({
    ...anime,
    anime_genres: anime.anime_genres?.map((ag: any) => ({ genres: ag.genres })) || [],
  }))

  return formattedData as Anime[]
}

export async function fetchAnimeById(id: string): Promise<Anime | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("anime")
    .select(
      `
      *,
      anime_genres(
        genres(
          id,
          name,
          slug
        )
      ),
      anime_studios(
        studios(
          id,
          name,
          slug
        )
      ),
      anime_tags(
        tags(
          id,
          name,
          slug
        )
      ),
      anime_translations(
        id,
        kind,
        link,
        episodes_count,
        translator
      )
    `,
    )
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching anime by ID:", error)
    return null
  }

  if (!data) {
    return null
  }

  // Ensure nested relations are correctly formatted
  const formattedData = {
    ...data,
    anime_genres: data.anime_genres?.map((ag: any) => ({ genres: ag.genres })) || [],
    anime_studios: data.anime_studios?.map((as: any) => ({ studios: as.studios })) || [],
    anime_tags: data.anime_tags?.map((at: any) => ({ tags: at.tags })) || [],
  }

  return formattedData as Anime
}

export async function fetchAnimeCatalog(
  page: number,
  limit: number,
  filters: {
    genres?: string[]
    years?: string[]
    kind?: string[]
    status?: string[]
    search?: string
  },
): Promise<{ data: Anime[]; count: number }> {
  const supabase = createClient()
  let query = supabase.from("anime").select(
    `
    id,
    name,
    poster,
    score,
    anime_genres(
      genres(
        id,
        name,
        slug
      )
    ),
    anime_kind
  `,
    { count: "exact" },
  )

  if (filters.genres && filters.genres.length > 0) {
    query = query.in("anime_genres.genres.slug", filters.genres)
  }
  if (filters.years && filters.years.length > 0) {
    query = query.in("release_year", filters.years)
  }
  if (filters.kind && filters.kind.length > 0) {
    query = query.in("anime_kind", filters.kind)
  }
  if (filters.status && filters.status.length > 0) {
    query = query.in("status", filters.status)
  }
  if (filters.search) {
    query = query.ilike("name", `%${filters.search}%`)
  }

  const { data, error, count } = await query
    .range((page - 1) * limit, page * limit - 1)
    .order("score", { ascending: false }) // Default order

  if (error) {
    console.error("Error fetching anime catalog:", error)
    return { data: [], count: 0 }
  }

  // Ensure anime_genres is an array of objects with a 'genres' property
  const formattedData =
    data?.map((anime) => ({
      ...anime,
      anime_genres: anime.anime_genres?.map((ag: any) => ({ genres: ag.genres })) || [],
    })) || []

  return { data: formattedData as Anime[], count: count || 0 }
}

export async function fetchGenres(): Promise<{ id: number; name: string; slug: string }[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from("genres").select("id, name, slug")
  if (error) {
    console.error("Error fetching genres:", error)
    return []
  }
  return data || []
}

export async function fetchYears(): Promise<number[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("anime")
    .select("release_year")
    .not("release_year", "is", null)
    .order("release_year", { ascending: false })
    .distinct("release_year")

  if (error) {
    console.error("Error fetching years:", error)
    return []
  }
  const years = data?.map((item) => item.release_year).filter(Boolean) as number[]
  return Array.from(new Set(years)).sort((a, b) => b - a)
}

export async function fetchKinds(): Promise<string[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("anime")
    .select("anime_kind")
    .not("anime_kind", "is", null)
    .distinct("anime_kind")

  if (error) {
    console.error("Error fetching kinds:", error)
    return []
  }
  const kinds = data?.map((item) => item.anime_kind).filter(Boolean) as string[]
  return Array.from(new Set(kinds)).sort()
}

export async function fetchStatuses(): Promise<string[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from("anime").select("status").not("status", "is", null).distinct("status")

  if (error) {
    console.error("Error fetching statuses:", error)
    return []
  }
  const statuses = data?.map((item) => item.status).filter(Boolean) as string[]
  return Array.from(new Set(statuses)).sort()
}

export async function fetchTags(): Promise<{ id: number; name: string; slug: string }[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from("tags").select("id, name, slug")
  if (error) {
    console.error("Error fetching tags:", error)
    return []
  }
  return data || []
}

export async function fetchStudios(): Promise<{ id: number; name: string; slug: string }[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from("studios").select("id, name, slug")
  if (error) {
    console.error("Error fetching studios:", error)
    return []
  }
  return data || []
}
