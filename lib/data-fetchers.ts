// lib/data-fetchers.ts
import createClient from "@/lib/supabase/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";

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

const enrichWithUserStatus = async (supabase: SupabaseClient, user: User | null, animeList: any[] | null) => {
  if (!user || !animeList || animeList.length === 0) return animeList;
  const animeIds = animeList.map(a => a.id);
  const { data: userListsData } = await supabase
    .from("user_lists")
    .select("anime_id, status")
    .eq("user_id", user.id)
    .in("anime_id", animeIds);
  if (!userListsData) return animeList;
  const statusMap = new Map(userListsData.map(item => [item.anime_id, item.status]));
  return animeList.map(anime => ({
    ...anime,
    user_list_status: statusMap.get(anime.id) || null,
  }));
};

export async function getHomePageData() {
  const supabase = await createClient();
  // enrichWithUserStatus // <-- ЭТА СТРОКА УДАЛЕНА
  try {
    const { data: { user } } = await supabase.auth.getUser();

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
      hero: await enrichWithUserStatus(supabase, user, heroData),
      trending: await enrichWithUserStatus(supabase, user, processCarouselData(trendingResponse)),
      popular: await enrichWithUserStatus(supabase, user, processCarouselData(popularResponse)),
      latestUpdates: await enrichWithUserStatus(supabase, user, processCarouselData(latestUpdatesResponse)),
    };

  } catch (error) {
    console.error("Ошибка при загрузке данных для главной страницы:", error);
    return { hero: [], trending: [], popular: [], latestUpdates: [] };
  }
}

// --- ДОБАВЛЕНО: Экспорт функции getHomepageSections ---
// Эта функция будет вызываться из app/page.tsx
export async function getHomepageSections() {
  const data = await getHomePageData(); // <-- Вызываем существующую функцию
  // Возвращаем объект с теми же полями, которые ожидает app/page.tsx
  return {
    hero: data.hero,
    trending: data.trending,
    popular: data.popular,
    latestUpdates: data.latestUpdates,
    // Добавь другие секции, если они используются в других частях сайта
  };
}
// --- КОНЕЦ ДОБАВЛЕНИЯ ---
