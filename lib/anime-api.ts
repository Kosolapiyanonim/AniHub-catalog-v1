import type { CatalogAnime, CatalogResponse } from "./types"

// Универсальная функция для получения списков аниме
async function fetchAnimeList(params: URLSearchParams): Promise<CatalogResponse> {
  try {
    const response = await fetch(`/api/catalog?${params.toString()}`)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching anime list:", error)
    return { results: [], total: 0, hasMore: false, page: 1, limit: 24 }
  }
}

// Получение популярных аниме (по количеству голосов)
export function getPopularAnime(limit = 18): Promise<CatalogResponse> {
  const params = new URLSearchParams({
    limit: limit.toString(),
    sort: "shikimori_votes",
    order: "desc",
  })
  return fetchAnimeList(params)
}

// Получение топ-рейтинговых аниме
export function getTopRatedAnime(limit = 18): Promise<CatalogResponse> {
  const params = new URLSearchParams({
    limit: limit.toString(),
    sort: "shikimori_rating",
    order: "desc",
  })
  return fetchAnimeList(params)
}

// Получение новых аниме
export function getNewestAnime(limit = 18): Promise<CatalogResponse> {
  const params = new URLSearchParams({
    limit: limit.toString(),
    sort: "year",
    order: "desc",
  })
  return fetchAnimeList(params)
}

// Поиск аниме
export function searchAnime(query: string, limit = 24): Promise<CatalogResponse> {
  const params = new URLSearchParams({
    limit: limit.toString(),
    title: query,
  })
  return fetchAnimeList(params)
}

// Получение аниме с фильтрами
export function getFilteredAnime(filters: {
  page?: number
  limit?: number
  sort?: string
  order?: string
  genres?: string[]
  year?: string
  status?: string[]
  title?: string
}): Promise<CatalogResponse> {
  const params = new URLSearchParams()

  if (filters.page) params.append("page", filters.page.toString())
  if (filters.limit) params.append("limit", filters.limit.toString())
  if (filters.sort) params.append("sort", filters.sort)
  if (filters.order) params.append("order", filters.order)
  if (filters.title) params.append("title", filters.title)
  if (filters.year && filters.year !== "all") params.append("year", filters.year)
  if (filters.genres && filters.genres.length > 0) params.append("genres", filters.genres.join(","))
  if (filters.status && filters.status.length > 0) params.append("status", filters.status.join(","))

  return fetchAnimeList(params)
}

// Получение одного аниме по ID
export async function getAnimeById(shikimoriId: string): Promise<CatalogAnime | null> {
  try {
    const response = await fetch(`/api/anime/${shikimoriId}`)
    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching anime by ID:", error)
    return null
  }
}
