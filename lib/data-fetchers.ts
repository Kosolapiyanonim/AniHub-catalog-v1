// lib/data-fetchers.ts

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { SupabaseClient, Session } from "@supabase/supabase-js";

// --- [ИСПРАВЛЕНИЕ] Единый набор полей для всех карточек, чтобы избежать ошибок ---
const ANIME_CARD_SELECT = `
    id, shikimori_id, title, poster_url, year, type, status, 
    episodes_aired, episodes_total, shikimori_rating, description, 
    genres:anime_genres(genres(id, name, slug))
`;

// Запрос для Hero-секции остается более легковесным
const HERO_ANIME_SELECT = `
    id, shikimori_id, title, poster_url, screenshots, year, description, 
    shikimori_rating, episodes_aired, episodes_total, status, type,
    genres:anime_genres(genres(name))
`;

const enrichWithUserStatus = async (supabase: SupabaseClient, session: Session | null, animeList: any[] | null) => {
  if (!session || !animeList || animeList.length === 0) return animeList;
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
enrichWithUserStatus
  try {
    const { data: { session } } = await supabase.auth.getSession();

    // --- [ИСПРАВЛЕНИЕ] Все запросы теперь идут к стабильной таблице 'animes' ---
    const [
      heroAnimesResponse,
      trendingResponse,
      popularResponse,
      latestUpdatesResponse
    ] = await Promise.all([
      // Изменено: используем обновленный HERO_ANIME_SELECT
      supabase.from("animes").select(HERO_ANIME_SELECT).eq("is_featured_in_hero", true).limit(10),
      supabase.from("animes").select(ANIME_CARD_SELECT).order("shikimori_rating", { ascending: false, nullsFirst: false }).limit(12),
      supabase.from("animes").select(ANIME_CARD_SELECT).order("shikimori_votes", { ascending: false, nullsFirst: false }).limit(12),
      supabase.from("animes").select(ANIME_CARD_SELECT).order("updated_at_kodik", { ascending: false, nullsFirst: false }).limit(12)
    ]);

    // Обработка данных для Hero-слайдера
    const heroData = heroAnimesResponse.data?.map(anime => ({
      ...anime,
      // Извлекаем жанры
      genres: anime.genres.map((g: any) => g.genres.name),
      // --- НОВОЕ: Обработка screenshots ---
      // Берем первый скриншот для фона, если он есть
      background_screenshot: anime.screenshots && anime.screenshots.length > 0 ? anime.screenshots[0] : null,
      // --- КОНЕЦ НОВОГО ---
  })) || [];
    
    // Обработка данных для каруселей
    const processCarouselData = (response: any) => {
        return response.data?.map((anime: any) => ({
            ...anime,
            genres: anime.genres.map((g: any) => g.genres).filter(Boolean)
        })) || [];
    };

    return {
      hero: await enrichWithUserStatus(supabase, session, heroData),
      trending: await enrichWithUserStatus(supabase, session, processCarouselData(trendingResponse)),
      popular: await enrichWithUserStatus(supabase, session, processCarouselData(popularResponse)),
      latestUpdates: await enrichWithUserStatus(supabase, session, processCarouselData(latestUpdatesResponse)),
    };

  } catch (error) {
    console.error("Ошибка при загрузке данных для главной страницы:", error);
    return { hero: [], trending: [], popular: [], latestUpdates: [] };
  }
}
