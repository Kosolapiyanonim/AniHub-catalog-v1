export interface Anime {
  id: number
  shikimori_id: string
  title: string
  poster_url?: string | null
  background_image_url?: string | null
  year?: number | null
  description?: string
  type?: string
  episodes_aired?: number | null
  episodes_total?: number | null
  status?: string | null
  shikimori_rating?: number
  // ... другие поля, если есть
}
