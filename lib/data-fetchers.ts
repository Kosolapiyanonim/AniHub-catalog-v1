import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { Anime, AnimeWithGenresAndStudios, HomePageSection, SearchResult, Translation, Profile, UserAnimeList } from "./types"

export async function getAnimeById(shikimoriId: string): Promise<AnimeWithGenresAndStudios | null> {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: animeData, error } = await supabase
    .from("animes")
    .select(`
      *,
      genres:anime_genres(genres(name)),
      studios:anime_studios(studios(name))
    `)
    .eq("shikimori_id", shikimoriId)
    .single()

  if (error) {
    console.error("Error fetching anime by ID:", error.message)
    return null
  }

  return animeData
}

export async function getAnimeTranslations(animeId: string): Promise<Translation[]> {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: translations, error } = await supabase
    .from("translations")
    .select("*")
    .eq("anime_id", animeId)
    .order("title")

  if (error) {
    console.error("Error fetching translations:", error.message)
    return []
  }

  return translations
}

export async function getHomePageSections(): Promise<HomePageSection[]> {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: sections, error } = await supabase
    .from("homepage_sections")
    .select(`
      id,
      title,
      type,
      animes:homepage_section_animes(anime_id)
    `)
    .order("order", { ascending: true })

  if (error) {
    console.error("Error fetching homepage sections:", error.message)
    return []
  }

  const sectionsWithAnime: HomePageSection[] = []

  for (const section of sections) {
    const animeIds = section.animes.map((a: { anime_id: string }) => a.anime_id)
    if (animeIds.length > 0) {
      const { data: animes, error: animeError } = await supabase
        .from("animes")
        .select("*")
        .in("id", animeIds)
        .order("shikimori_rating", { ascending: false }) // Example ordering

      if (animeError) {
        console.error(`Error fetching anime for section ${section.title}:`, animeError.message)
        continue
      }
      sectionsWithAnime.push({
        id: section.id,
        title: section.title,
        type: section.type as "carousel" | "grid",
        animes: animes || [],
      })
    } else {
      sectionsWithAnime.push({
        id: section.id,
        title: section.title,
        type: section.type as "carousel" | "grid",
        animes: [],
      })
    }
  }

  return sectionsWithAnime
}

export async function searchAnime(query: string): Promise<SearchResult[]> {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("animes")
    .select(`
      id,
      shikimori_id,
      title,
      title_orig,
      poster_url,
      episodes_total,
      episodes_aired,
      status,
      genres:anime_genres(genres(name)),
      year
    `)
    .or(`title.ilike.%${query}%,title_orig.ilike.%${query}%`)
    .limit(20)

  if (error) {
    console.error("Error searching anime:", error.message)
    return []
  }

  return data || []
}

export async function getUserProfile(userId: string): Promise<Profile | null> {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url, website, bio")
    .eq("id", userId)
    .single()

  if (error) {
    console.error("Error fetching user profile:", error.message)
    return null
  }

  return profile
}

export async function getUserAnimeLists(userId: string): Promise<UserAnimeList[]> {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: userAnimeLists, error } = await supabase
    .from("user_anime_lists")
    .select(`
      id,
      status,
      score,
      episodes_watched,
      anime_id
    `)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })

  if (error) {
    console.error("Error fetching user anime lists:", error.message)
    return []
  }

  return userAnimeLists || []
}
