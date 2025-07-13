// /lib/data-fetchers.ts

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const ANIME_CARD_SELECT = "id, shikimori_id, title, poster_url, year, type";
const HERO_ANIME_SELECT = `${ANIME_CARD_SELECT}, description, screenshots, shikimori_rating`;

export async function getHomePageData() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  try {
    const [
      heroAnimesResponse,
      trendingResponse,
      popularResponse
    ] = await Promise.all([
      supabase.from("animes").select(HERO_ANIME_SELECT).eq("is_featured_in_hero", true).not('shikimori_id', 'is', null).order("shikimori_rating", { ascending: false, nullsFirst: true }).limit(10),
      supabase.from("animes_with_details").select(ANIME_CARD_SELECT).not('shikimori_id', 'is', null).order("weighted_rating", { ascending: false }).limit(12),
      supabase.from("animes").select(ANIME_CARD_SELECT).not('shikimori_id', 'is', null).order("shikimori_votes", { ascending: false }).limit(12),
    ]);

    return {
      hero: heroAnimesResponse.data || [],
      trending: trendingResponse.data || [],
      popular: popularResponse.data || [],
    };

  } catch (error) {
    console.error("Ошибка при загрузке данных для главной страницы:", error);
    return { hero: [], trending: [], popular: [] };
  }
}
