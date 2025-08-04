// Базовые типы для Kodik API
export interface KodikTranslation {
  id: string
  title: string
  type: string
}

export interface KodikMaterialData {
  title?: string
  anime_title?: string
  title_orig?: string
  poster_url?: string
  anime_poster_url?: string
  description?: string
  anime_description?: string
  year?: number
  kinopoisk_rating?: number
  shikimori_rating?: number
  shikimori_votes?: number
  kinopoisk_votes?: number
  anime_genres?: string[]
  anime_studios?: string[]
  countries?: string[]
  anime_status?: string
  episodes_count?: number
  episodes_total?: number
  duration?: number
  rating_mpaa?: string
  imdb_rating?: number
}

export interface KodikAnimeData {
  id: string
  title: string
  title_orig?: string
  year?: number
  link: string
  type: string
  quality?: string
  translation: KodikTranslation
  episodes_count?: number
  shikimori_id?: string
  kinopoisk_id?: string
  material_data?: KodikMaterialData
  screenshots?: string[]
  updated_at?: string
}

// Типы для нашей базы данных
export interface AnimeRecord {
  id: number
  shikimori_id: string
  kinopoisk_id?: string
  title: string
  title_orig?: string
  year?: number
  poster_url?: string
  description?: string
  status?: string
  episodes_count?: number
  shikimori_rating?: number
  shikimori_votes?: number
  kinopoisk_rating?: number
  kinopoisk_votes?: number
  imdb_rating?: number
  rating_mpaa?: string
  player_link?: string
  screenshots?: any
  raw_data?: any
  updated_at_kodik?: string
  created_at: string
  updated_at: string
}

export interface GenreRecord {
  id: number
  name: string
  created_at: string
}

export interface StudioRecord {
  id: number
  name: string
  created_at: string
}

export interface CountryRecord {
  id: number
  name: string
  created_at: string
}

// Тип для представления с отношениями
export interface CatalogAnime {
  id: number
  shikimori_id: string
  title: string
  title_orig?: string
  year?: number
  poster_url?: string
  description?: string
  status?: string
  episodes_count?: number
  shikimori_rating?: number
  shikimori_votes?: number
  player_link?: string
  genres?: string[]
  studios?: string[]
  countries?: string[]
  created_at: string
  updated_at: string
}

// API Response типы
export interface CatalogResponse {
  results: CatalogAnime[]
  total: number
  hasMore: boolean
  page: number
  limit: number
}

export interface GenresResponse {
  genres: string[]
  total: number
}

export interface YearsResponse {
  years: number[]
  total: number
}
