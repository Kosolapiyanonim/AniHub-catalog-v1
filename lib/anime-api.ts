import { KodikAnime, KodikTranslation, KodikPlayerLinkResponse } from "./types"

const KODIK_API_BASE_URL = "https://kodikapi.com"
const KODIK_API_TOKEN = process.env.KODIK_API_TOKEN

if (!KODIK_API_TOKEN) {
  console.warn("KODIK_API_TOKEN is not set. Kodik API calls will fail.")
}

export async function searchKodikAnime(title: string): Promise<KodikAnime[]> {
  if (!KODIK_API_TOKEN) return []

  const params = new URLSearchParams({
    token: KODIK_API_TOKEN,
    title: title,
    limit: "10",
    with_material_data: "true",
    with_translations: "true",
  })

  try {
    const response = await fetch(`${KODIK_API_BASE_URL}/search?${params.toString()}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data.results || []
  } catch (error) {
    console.error("Error searching Kodik anime:", error)
    return []
  }
}

export async function getKodikTranslations(linkId: string): Promise<KodikTranslation[]> {
  if (!KODIK_API_TOKEN) return []

  const params = new URLSearchParams({
    token: KODIK_API_TOKEN,
    link_id: linkId,
  })

  try {
    const response = await fetch(`${KODIK_API_BASE_URL}/translations?${params.toString()}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data.results || []
  } catch (error) {
    console.error("Error fetching Kodik translations:", error)
    return []
  }
}

export async function getKodikPlayerLink(linkId: string): Promise<string | null> {
  if (!KODIK_API_TOKEN) return null

  const params = new URLSearchParams({
    token: KODIK_API_TOKEN,
    link_id: linkId,
  })

  try {
    const response = await fetch(`${KODIK_API_BASE_URL}/get_player_link?${params.toString()}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data: KodikPlayerLinkResponse = await response.json()
    return data.link || null
  } catch (error) {
    console.error("Error fetching Kodik player link:", error)
    return null
  }
}
