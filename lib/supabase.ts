import { createBrowserClient } from '@supabase/ssr'
import { Database } from './database.types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Типы для TypeScript
export interface Anime {
  id: number
  kodik_id: string
  shikimori_id: string
  kinopoisk_id?: string
  title: string
  title_orig?: string
  year?: number
  poster_url?: string
  player_link?: string
  description?: string
  type?: string
  status?: string
  episodes_count?: number
  rating_mpaa?: string
  kinopoisk_rating?: number
  imdb_rating?: number
  shikimori_rating?: number
  kinopoisk_votes?: number
  shikimori_votes?: number
  screenshots?: any
  updated_at_kodik?: string
  created_at: string
}

export interface Genre {
  id: number
  name: string
}

export interface Studio {
  id: number
  name: string
}

export interface Country {
  id: number
  name: string
}

export interface AnimeRelation {
  anime_id: number
  relation_id: number
  relation_type: "genre" | "studio" | "country"
}
