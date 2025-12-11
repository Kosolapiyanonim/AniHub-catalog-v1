import type { Anime, AnimeDetails, HomepageSections } from "./types"

// Client-safe functions that call our API routes instead of Kodik directly
export async function getAnimeList(
  limit = 20,
  offset = 0,
  filters: Record<string, any> = {},
): Promise<{ animes: Anime[]; total: number }> {
  try {
    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
      ...Object.fromEntries(
        Object.entries(filters)
          .filter(([_, v]) => v !== undefined && v !== null)
          .map(([k, v]) => [k, String(v)]),
      ),
    })

    const response = await fetch(`/api/kodik/list?${params}`)
    if (!response.ok) throw new Error("Failed to fetch anime list")
    return response.json()
  } catch (error) {
    console.error("Error fetching anime list:", error)
    return { animes: [], total: 0 }
  }
}

export async function getAnimeDetails(id: string): Promise<AnimeDetails | null> {
  try {
    const response = await fetch(`/api/kodik/details?id=${id}`)
    if (!response.ok) return null
    return response.json()
  } catch (error) {
    console.error(`Error fetching anime details for ID ${id}:`, error)
    return null
  }
}

export async function searchAnime(query: string, limit = 10): Promise<Anime[]> {
  if (!query) return []
  try {
    const response = await fetch(`/api/kodik/search?query=${encodeURIComponent(query)}&limit=${limit}`)
    if (!response.ok) return []
    const data = await response.json()
    return data.results || []
  } catch (error) {
    console.error(`Error searching anime for query "${query}":`, error)
    return []
  }
}

export async function getHomepageSectionsData(): Promise<HomepageSections> {
  try {
    const response = await fetch("/api/kodik/homepage")
    if (!response.ok) throw new Error("Failed to fetch homepage sections")
    return response.json()
  } catch (error) {
    console.error("Error fetching homepage sections:", error)
    return {
      hero: [],
      trending: [],
      popular: [],
      latestUpdates: [],
    }
  }
}

export async function getGenresList(): Promise<string[]> {
  try {
    const response = await fetch("/api/kodik/genres")
    if (!response.ok) return []
    return response.json()
  } catch (error) {
    console.error("Error fetching genres:", error)
    return []
  }
}

export async function getStatusesList(): Promise<string[]> {
  try {
    const response = await fetch("/api/kodik/statuses")
    if (!response.ok) return []
    return response.json()
  } catch (error) {
    console.error("Error fetching statuses:", error)
    return []
  }
}

export async function getStudiosList(): Promise<string[]> {
  try {
    const response = await fetch("/api/kodik/studios")
    if (!response.ok) return []
    return response.json()
  } catch (error) {
    console.error("Error fetching studios:", error)
    return []
  }
}

export async function getTypesList(): Promise<string[]> {
  try {
    const response = await fetch("/api/kodik/types")
    if (!response.ok) return []
    return response.json()
  } catch (error) {
    console.error("Error fetching types:", error)
    return []
  }
}

export async function getYearsList(): Promise<number[]> {
  try {
    const response = await fetch("/api/kodik/years")
    if (!response.ok) return []
    return response.json()
  } catch (error) {
    console.error("Error fetching years:", error)
    return []
  }
}
