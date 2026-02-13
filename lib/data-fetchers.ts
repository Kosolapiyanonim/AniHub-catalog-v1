import { unstable_cache, revalidatePath, revalidateTag } from "next/cache"
import createClient from "@/lib/supabase/server"
import type { SupabaseClient, User } from "@supabase/supabase-js"

const HOMEPAGE_SHELL_REVALIDATE_SECONDS = 300

const ANIME_CARD_SELECT = `
  id, shikimori_id, title, poster_url, year, type, status,
  episodes_aired, episodes_total, shikimori_rating, description,
  genres:anime_genres(genres(id, name, slug))
`

const HERO_ANIME_SELECT = `
  id, shikimori_id, title, poster_url, screenshots, year, description,
  shikimori_rating, episodes_aired, episodes_total, status, type,
  genres:anime_genres(genres(name))
`

type HomeSectionName = "trending" | "popular" | "latestUpdates"

const EMPTY_HOME_DATA = {
  hero: [],
  trending: [],
  popular: [],
  latestUpdates: [],
}

const enrichWithUserStatus = async (supabase: SupabaseClient, user: User | null, animeList: any[] | null) => {
  if (!user || !animeList || animeList.length === 0) return animeList

  const animeIds = animeList.map((anime) => anime.id)
  const { data: userListsData } = await supabase
    .from("user_lists")
    .select("anime_id, status")
    .eq("user_id", user.id)
    .in("anime_id", animeIds)

  if (!userListsData) return animeList

  const statusMap = new Map(userListsData.map((item) => [item.anime_id, item.status]))

  return animeList.map((anime) => ({
    ...anime,
    user_list_status: statusMap.get(anime.id) || null,
  }))
}

const mapHeroData = (animeList: any[] | null) =>
  animeList?.map((anime) => ({
    ...anime,
    genres: anime.genres?.map((genreItem: any) => genreItem.genres.name).filter(Boolean) || [],
    background_image_url: anime.screenshots && anime.screenshots.length > 0 ? anime.screenshots[0] : anime.poster_url,
  })) || []

const mapSectionData = (animeList: any[] | null) =>
  animeList?.map((anime: any) => ({
    ...anime,
    genres: anime.genres?.map((genreItem: any) => genreItem.genres).filter(Boolean) || [],
  })) || []

const getHeroCriticalDataCached = unstable_cache(
  async () => {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("animes")
      .select(HERO_ANIME_SELECT)
      .eq("is_featured_in_hero", true)
      .limit(10)

    if (error) {
      console.error("Ошибка загрузки hero-данных:", error)
      return []
    }

    return mapHeroData(data)
  },
  ["homepage-hero-critical"],
  { revalidate: HOMEPAGE_SHELL_REVALIDATE_SECONDS, tags: ["homepage", "homepage:hero"] },
)

const getSecondarySectionsCached = unstable_cache(
  async () => {
    const supabase = await createClient()

    const [trendingResponse, popularResponse, latestUpdatesResponse] = await Promise.all([
      supabase.from("animes").select(ANIME_CARD_SELECT).order("shikimori_rating", { ascending: false, nullsFirst: false }).limit(12),
      supabase.from("animes").select(ANIME_CARD_SELECT).order("shikimori_votes", { ascending: false, nullsFirst: false }).limit(12),
      supabase.from("animes").select(ANIME_CARD_SELECT).order("updated_at_kodik", { ascending: false, nullsFirst: false }).limit(12),
    ])

    return {
      trending: mapSectionData(trendingResponse.data),
      popular: mapSectionData(popularResponse.data),
      latestUpdates: mapSectionData(latestUpdatesResponse.data),
    }
  },
  ["homepage-secondary-sections"],
  {
    revalidate: HOMEPAGE_SHELL_REVALIDATE_SECONDS,
    tags: ["homepage", "homepage:sections", "homepage:sections:trending", "homepage:sections:popular", "homepage:sections:latest"],
  },
)

export async function getHomeHeroCriticalData() {
  return getHeroCriticalDataCached()
}

export async function getHomeSecondarySections() {
  return getSecondarySectionsCached()
}

export async function getHomePageData() {
  try {
    const [hero, secondarySections] = await Promise.all([getHomeHeroCriticalData(), getHomeSecondarySections()])

    return {
      hero,
      ...secondarySections,
    }
  } catch (error) {
    console.error("Ошибка при загрузке данных для главной страницы:", error)
    return EMPTY_HOME_DATA
  }
}

export async function getHomepageSections() {
  return getHomePageData()
}

export async function getUserHomepageEnhancements(userId: string, section: HomeSectionName, animeIds: number[]) {
  if (!userId || animeIds.length === 0) return []

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.id !== userId) {
    return []
  }

  const { data } = await supabase
    .from("user_lists")
    .select("anime_id, status")
    .eq("user_id", userId)
    .in("anime_id", animeIds)

  return (data || []).map((item) => ({ ...item, section }))
}

export async function revalidateHomepageCaches() {
  revalidateTag("homepage")
  revalidateTag("homepage:hero")
  revalidateTag("homepage:sections")
  revalidatePath("/")
}

export async function enrichHomepageSectionWithUserStatus(section: HomeSectionName, userId: string, animeList: any[] | null) {
  const supabase = await createClient()
  const enriched = await enrichWithUserStatus(supabase, { id: userId } as User, animeList)

  return {
    section,
    items: enriched || [],
  }
}
