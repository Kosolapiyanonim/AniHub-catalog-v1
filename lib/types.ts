import { Database } from "./database.types"

export type Anime = Database["public"]["Tables"]["animes"]["Row"]
export type Genre = Database["public"]["Tables"]["genres"]["Row"]
export type Studio = Database["public"]["Tables"]["studios"]["Row"]
export type Translation = Database["public"]["Tables"]["translations"]["Row"]
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type UserAnimeList = Database["public"]["Tables"]["user_anime_lists"]["Row"]

export type AnimeWithGenresAndStudios = Anime & {
  genres: { genres: Pick<Genre, "name"> }[]
  studios: { studios: Pick<Studio, "name"> }[]
}

export type UserAnimeListItem = UserAnimeList & {
  anime: Pick<Anime, "id" | "shikimori_id" | "title" | "title_orig" | "poster_url" | "episodes_total" | "episodes_aired" | "status">
}

export type HomePageSection = {
  id: string
  title: string
  type: "carousel" | "grid"
  animes: Anime[]
}

export type SearchResult = {
  id: string
  shikimori_id: number | null
  title: string
  title_orig: string | null
  poster_url: string | null
  episodes_total: number | null
  episodes_aired: number | null
  status: string | null
  genres: { genres: Pick<Genre, "name"> }[] | null
  year: number | null
}

export type KodikAnime = {
  id: string
  title: string
  title_orig: string
  link: string
  material_data: {
    shikimori_id: number
    poster_url: string
    description: string
    year: number
    episodes_total: number
    episodes_aired: number
    status: string
    genres: string[]
    studios: string[]
    rating_mpaa: string
    minimal_age: number
    anime_kind: string
    anime_status: string
    anime_genres: string[]
    anime_studios: string[]
    anime_licensors: string[]
    anime_franchise: string
    anime_aired_at: string
    anime_next_episode_at: string
    anime_episodes_aired: number
    anime_episodes_total: number
    anime_shikimori_rating: number
    anime_shikimori_votes: number
  }
  translations: {
    id: string
    title: string
    type: string
    quality: string
  }[]
}

export type KodikTranslation = {
  id: string
  title: string
  type: string
  quality: string
  link_id: string
}

export type KodikPlayerLinkResponse = {
  link: string
}
