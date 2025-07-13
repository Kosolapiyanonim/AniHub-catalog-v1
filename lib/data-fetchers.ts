// /lib/data-fetchers.ts

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const ANIME_CARD_SELECT = "id, shikimori_id, title, poster_url, year, shikimori_rating, episodes_count, type";
// ИЗМЕНЕНИЕ: Добавляем 'screenshots' в запрос
const HERO_ANIME_SELECT = `${ANIME_CARD_SELECT}, description, screenshots`;

const getBestQuality = (translations: { quality: string | null }[]): string | null => {
  if (!translations || translations.length === 0) return null;
  const qualities = translations.map(t => t.quality).filter(Boolean) as string[];
  if (qualities.includes('FHD')) return 'FHD';
  if (qualities.includes('HD')) return 'HD';
  if (qualities.length > 0) return qualities[0];
  return null;
};

export async function getHomePageData() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  try {
    const { data: { session } } = await supabase.auth.getSession();

    const [
      heroAnimesResponse,
      trending,
      popular,
      recentlyCompleted,
      latestUpdates,
    ] = await Promise.all([
      supabase.from("animes").select(HERO_ANIME_SELECT).eq("is_featured_in_hero", true).not('shikimori_id', 'is', null).order("shikimori_rating", { ascending: false, nullsFirst: true }).limit(10),
      // ... (остальные запросы без изменений)
      supabase.from("animes_with_details").select(ANIME_CARD_SELECT).gte("updated_at_kodik", new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()).not('shikimori_id', 'is', null).order("weighted_rating", { ascending: false }).limit(12),
      supabase.from("animes").select(ANIME_CARD_SELECT).not('shikimori_id', 'is', null).order("shikimori_votes", { ascending: false }).limit(12),
      supabase.from("animes_with_details").select(ANIME_CARD_SELECT).eq("status", "released").gte("updated_at_kodik", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()).not('shikimori_id', 'is', null).order("weighted_rating", { ascending: false }).limit(12),
      supabase.from("animes_with_details").select(ANIME_CARD_SELECT).not('shikimori_id', 'is', null).order("updated_at_kodik", { ascending: false }).order("weighted_rating", { ascending: false }).limit(12),
    ]);

    let heroWithDetails = [];
    if (heroAnimesResponse.data) {
      const heroAnimeIds = heroAnimesResponse.data.map(a => a.id);
      const { data: translations } = await supabase.from("translations").select("anime_id, quality").in("anime_id", heroAnimeIds);
      const translationsMap = new Map<number, { quality: string | null }[]>();
      if (translations) {
        for (const t of translations) {
          if (!translationsMap.has(t.anime_id)) {
            translationsMap.set(t.anime_id, []);
          }
          translationsMap.get(t.anime_id)!.push(t);
        }
      }
      heroWithDetails = heroAnimesResponse.data.map(anime => ({
        ...anime,
        best_quality: getBestQuality(translationsMap.get(anime.id) || [])
      }));
    }

    let continueWatching = null;
    let myUpdates = null;
    if (session) {
      // ... (логика персональных секций)
    }
    
    return {
      hero: heroWithDetails,
      trending: trending.data || [],
      popular: popular.data || [],
      recentlyCompleted: recentlyCompleted.data || [],
      latestUpdates: latestUpdates.data || [],
      continueWatching,
      myUpdates,
    };

  } catch (error) {
    console.error("Error directly fetching homepage data:", error);
    return { hero: [], trending: [], popular: [], recentlyCompleted: [], latestUpdates: [], continueWatching: null, myUpdates: null };
  }
}
