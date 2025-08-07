// Existing types (from previous context, assuming they are here)
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

// New types for User Profile
export interface Profile {
  id: string; // Corresponds to auth.users.id
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  website: string | null;
  bio: string | null;
  email: string; // Assuming email is always present from auth.users
  created_at: string;
}

export type AnimeListStatus = "watching" | "completed" | "planned" | "dropped" | "on_hold" | "favorite";

export interface UserAnimeList {
  id: number;
  user_id: string;
  anime_id: number;
  status: AnimeListStatus;
  score: number | null;
  episodes_watched: number | null;
  created_at: string;
  updated_at: string;
  anime: Anime; // Joined anime data
}
