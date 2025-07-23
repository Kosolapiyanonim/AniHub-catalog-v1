// lib/data-fetchers.ts

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const ANIME_CARD_SELECT = "id, shikimori_id, title, poster_url, year, type, shikimori_rating, episodes_total, episodes_aired, status, description, genres:anime_genres(genres(id, name, slug))";
const HERO_ANIME_SELECT = `id, shikimori_id, title, poster_url, year, type, description, screenshots, shikimori_rating, episodes_count`;

// --- [ИЗМЕНЕНИЕ] Функция для обогащения данных статусами пользователя ---
const enrichWithUserStatus = async (supabase: any, session: any, animeList: any[] | null) => {
  if (!session || !animeList || animeList.length === 0) {
    return animeList;
  }
  
  const animeIds = animeList.map(a => a.id);
  const { data: userListsData } = await supabase
    .from("user_lists")
    .select("anime_id, status")
    .eq("user_id", session.user.id)
    .in("anime_id", animeIds);
  
  if (!userListsData) return animeList;
  
  const statusMap = new Map(userListsData.map(item => [item.anime_id, item.status]));
  
  return animeList.map(anime => ({
    ...anime,
    user_list_status: statusMap.get(anime.id) || null,
  }));
};


export async function getHomePageData() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  try {
    // --- [ИЗМЕНЕНИЕ] Сначала получаем сессию пользователя ---
    const { data: { session } } = await supabase.auth.getSession();

    const [
      heroAnimesResponse,
      trendingResponse,
      popularResponse,
      latestUpdatesResponse
    ] = await Promise.all([
      supabase.from("animes").select(HERO_ANIME_SELECT).eq("is_featured_in_hero", true).limit(10),
      supabase.from("animes_with_details").select(ANIME_CARD_SELECT).order("weighted_rating", { ascending: false }).limit(12),
      supabase.from("animes").select(ANIME_CARD_SELECT).order("shikimori_votes", { ascending: false }).limit(12),
      supabase.from("animes_with_details").select(ANIME_CARD_SELECT).order("updated_at_kodik", { ascending: false }).limit(12),
    ]);

    // --- [ИЗМЕНЕНИЕ] Обогащаем каждую секцию статусами пользователя ---
    return {
      hero: await enrichWithUserStatus(supabase, session, heroAnimesResponse.data),
      trending: await enrichWithUserStatus(supabase, session, trendingResponse.data),
      popular: await enrichWithUserStatus(supabase, session, popularResponse.data),
      latestUpdates: await enrichWithUserStatus(supabase, session, latestUpdatesResponse.data),
    };

  } catch (error) {
    console.error("Ошибка при загрузке данных для главной страницы:", error);
    return { hero: [], trending: [], popular: [], latestUpdates: [] };
  }
}
