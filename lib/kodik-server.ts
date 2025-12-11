// Server-only Kodik API utilities
// This file should only be imported in API routes or server components

const KODIK_API_BASE = "https://kodikapi.com"

function getKodikToken(): string {
  const token = process.env.KODIK_API_TOKEN
  if (!token) {
    throw new Error("KODIK_API_TOKEN is not set")
  }
  return token
}

export async function fetchFromKodik(endpoint: string, params: Record<string, any> = {}): Promise<any> {
  const token = getKodikToken()
  const url = new URL(`${KODIK_API_BASE}${endpoint}`)
  url.searchParams.append("token", token)

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value))
    }
  }

  const response = await fetch(url.toString())
  if (!response.ok) {
    throw new Error(`Kodik API error: ${response.statusText}`)
  }

  const data = await response.json()
  if (data.error) {
    throw new Error(`Kodik API error: ${data.error}`)
  }

  return data
}

export function mapKodikResultToAnime(item: any) {
  return {
    id: item.id,
    title: {
      ru: item.title,
      en: item.material_data?.title_en || item.title,
    },
    poster: item.material_data?.poster_url || item.screenshots?.[0] || "/placeholder.jpg",
    description: item.material_data?.description || "Описание отсутствует.",
    genres: item.material_data?.genres || [],
    year: item.material_data?.year || null,
    rating: item.material_data?.shikimori_rating || null,
    episodes: item.material_data?.episodes_total || null,
    status: item.material_data?.anime_status || null,
    type: item.material_data?.anime_type || null,
    minimal_age: item.material_data?.minimal_age || null,
    shikimori_id: item.material_data?.shikimori_id || null,
    screenshots: item.screenshots || [],
  }
}

export function mapKodikResultToAnimeDetails(item: any) {
  return {
    ...mapKodikResultToAnime(item),
    seasons: item.seasons || {},
    player_link: item.link,
  }
}
