export interface Anime {
  id: string
  title: {
    ru: string
    en: string
  }
  poster: string
  description: string
  genres: string[]
  year: number | null
  rating: number | null
  episodes: number | null
  status: string | null
  type: string | null
  minimal_age: number | null
  shikimori_id: number | null
  screenshots: string[]
}

export interface AnimeDetails extends Anime {
  seasons: Record<string, Record<string, string>>
  player_link: string
}

export interface HomepageSections {
  hero: Anime[]
  trending: Anime[]
  popular: Anime[]
  latestUpdates: Anime[]
}

// Kodik API types
export interface KodikMaterialData {
  anime_title?: string
  anime_description?: string
  description?: string
  poster_url?: string
  anime_poster_url?: string
  anime_status?: string
  anime_genres?: string[]
  anime_studios?: string[]
  countries?: string[]
  episodes_total?: number
  rating_mpaa?: string
  kinopoisk_rating?: number
  imdb_rating?: number
  shikimori_rating?: number
  kinopoisk_votes?: number
  shikimori_votes?: number
}

export interface KodikAnimeData {
  id: string
  title: string
  title_orig?: string
  year?: number
  link?: string
  type?: string
  shikimori_id?: string
  kinopoisk_id?: string
  episodes_count?: number
  screenshots?: string[]
  updated_at?: string
  material_data?: KodikMaterialData
}

export interface AnimeRecord {
  id?: number
  shikimori_id?: string
  kinopoisk_id?: string
  kodik_id?: string
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
  screenshots?: { screenshots: string[] }
  updated_at_kodik?: string
  created_at?: string
}

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      animes: {
        Row: AnimeRecord
        Insert: Partial<AnimeRecord>
        Update: Partial<AnimeRecord>
        Relationships: []
      }
      genres: {
        Row: { id: number; name: string }
        Insert: { name: string }
        Update: { name?: string }
        Relationships: []
      }
      studios: {
        Row: { id: number; name: string }
        Insert: { name: string }
        Update: { name?: string }
        Relationships: []
      }
      countries: {
        Row: { id: number; name: string }
        Insert: { name: string }
        Update: { name?: string }
        Relationships: []
      }
      anime_genres: {
        Row: { anime_id: number; genre_id: number }
        Insert: { anime_id: number; genre_id: number }
        Update: { anime_id?: number; genre_id?: number }
        Relationships: []
      }
      anime_studios: {
        Row: { anime_id: number; studio_id: number }
        Insert: { anime_id: number; studio_id: number }
        Update: { anime_id?: number; studio_id?: number }
        Relationships: []
      }
      anime_countries: {
        Row: { anime_id: number; country_id: number }
        Insert: { anime_id: number; country_id: number }
        Update: { anime_id?: number; country_id?: number }
        Relationships: []
      }
      user_anime_lists: {
        Row: {
          anime_id: number
          created_at: string
          id: number
          status: string | null
          user_id: string
        }
        Insert: {
          anime_id: number
          created_at?: string
          id?: number
          status?: string | null
          user_id: string
        }
        Update: {
          anime_id?: number
          created_at?: string
          id?: number
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_anime_lists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
