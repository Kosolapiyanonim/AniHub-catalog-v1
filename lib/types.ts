export interface Anime {
  id: string;
  title: {
    ru: string;
    en: string;
  };
  poster: string;
  description: string;
  genres: string[];
    year: number | null;
  rating: number | null;
  episodes: number | null;
  status: string | null;
  type: string | null;
  minimal_age: number | null;
  shikimori_id: number | null;
  screenshots: string[];
}

export interface AnimeDetails extends Anime {
  seasons: Record<string, Record<string, string>>; // { "1": { "1": "episode_link" } }
  player_link: string;
}

export interface HomepageSections {
  hero: Anime[];
  trending: Anime[];
  popular: Anime[];
  latestUpdates: Anime[];
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
