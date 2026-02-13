// lib/data-fetchers.ts
import { unstable_cache } from "next/cache";

import createClient from "@/lib/supabase/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";

const ANIME_CARD_SELECT = `
    id, shikimori_id, title, poster_url, year, type, status,
    episodes_aired, episodes_total, shikimori_rating, description,
    genres:anime_genres(genres(id, name, slug))
`;

const HERO_ANIME_SELECT = `
    id, shikimori_id, title, poster_url, screenshots, year, description,
    shikimori_rating, episodes_aired, episodes_total, status, type,
    genres:anime_genres(genres(name))
`;

const enrichWithUserStatus = async (supabase: SupabaseClient, user: User | null, animeList: any[] | null) => {
  if (!user || !animeList || animeList.length === 0) return animeList;

  const animeIds = animeList.map((anime) => anime.id);
  const { data: userListsData } = await supabase
    .from("user_lists")
    .select("anime_id, status")
    .eq("user_id", user.id)
    .in("anime_id", animeIds);

  if (!userListsData) return animeList;

  const statusMap = new Map(userListsData.map((item) => [item.anime_id, item.status]));
  return animeList.map((anime) => ({
    ...anime,
    user_list_status: statusMap.get(anime.id) || null,
  }));
};

const mapHeroData = (heroRows: any[] | null) =>
  heroRows?.map((anime) => ({
    ...anime,
    genres: anime.genres.map((g: any) => g.genres.name),
    background_image_url: anime.screenshots && anime.screenshots.length > 0 ? anime.screenshots[0] : anime.poster_url,
  })) || [];

const mapCarouselData = (response: any) =>
  response.data?.map((anime: any) => ({
    ...anime,
    genres: anime.genres.map((g: any) => g.genres).filter(Boolean),
  })) || [];

const getHomepageHeroCriticalDataCached = unstable_cache(
  async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("animes")
      .select(HERO_ANIME_SELECT)
      .eq("is_featured_in_hero", true)
      .limit(10);

    if (error) {
      console.error("Ошибка загрузки hero-секции:", error);
      return [];
    }

    return mapHeroData(data);
  },
  ["homepage-hero-critical"],
  { revalidate: 300, tags: ["homepage", "homepage:hero"] },
);

const getHomepageSecondarySectionsCached = unstable_cache(
  async () => {
    const supabase = await createClient();
    const [trendingResponse, popularResponse, latestUpdatesResponse] = await Promise.all([
      supabase.from("animes").select(ANIME_CARD_SELECT).order("shikimori_rating", { ascending: false, nullsFirst: false }).limit(12),
      supabase.from("animes").select(ANIME_CARD_SELECT).order("shikimori_votes", { ascending: false, nullsFirst: false }).limit(12),
      supabase.from("animes").select(ANIME_CARD_SELECT).order("updated_at_kodik", { ascending: false, nullsFirst: false }).limit(12),
    ]);

    return {
      trending: mapCarouselData(trendingResponse),
      popular: mapCarouselData(popularResponse),
      latestUpdates: mapCarouselData(latestUpdatesResponse),
    };
  },
  ["homepage-secondary-sections"],
  { revalidate: 300, tags: ["homepage", "homepage:sections"] },
);

export async function getHomePageData() {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const hero = await getHomepageHeroCriticalDataCached();
    const secondary = await getHomepageSecondarySectionsCached();

    return {
      hero: await enrichWithUserStatus(supabase, user, hero),
      trending: await enrichWithUserStatus(supabase, user, secondary.trending),
      popular: await enrichWithUserStatus(supabase, user, secondary.popular),
      latestUpdates: await enrichWithUserStatus(supabase, user, secondary.latestUpdates),
    };
  } catch (error) {
    console.error("Ошибка при загрузке данных для главной страницы:", error);
    return { hero: [], trending: [], popular: [], latestUpdates: [] };
  }
}

export async function getHomepageHeroCriticalData() {
  return getHomepageHeroCriticalDataCached();
}

export async function getHomepageSectionsDeferred() {
  return getHomepageSecondarySectionsCached();
}

export async function getHomepageSections() {
  const [hero, sections] = await Promise.all([getHomepageHeroCriticalDataCached(), getHomepageSecondarySectionsCached()]);
  return { hero, ...sections };
}
