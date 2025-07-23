// app/api/homepage-sections/route.ts

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

const ANIME_CARD_SELECT = "id, shikimori_id, title, poster_url, year, type, shikimori_rating, episodes_total, episodes_aired, status, description, genres:anime_genres(genres(id, name, slug))";
const HERO_ANIME_SELECT = `id, shikimori_id, title, poster_url, year, type, description, screenshots, shikimori_rating, episodes_count`;

export async function GET() {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    const { data: { session } } = await supabase.auth.getSession();

    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    const [
      heroAnimesResponse,
      trending,
      popular,
      latestUpdates,
    ] = await Promise.all([
      supabase.from("animes").select(HERO_ANIME_SELECT).eq("is_featured_in_hero", true).limit(10),
      supabase.from("animes_with_details").select(ANIME_CARD_SELECT).gte("updated_at_kodik", twoMonthsAgo.toISOString()).order("weighted_rating", { ascending: false }).limit(12),
      supabase.from("animes").select(ANIME_CARD_SELECT).order("shikimori_votes", { ascending: false }).limit(12),
      supabase.from("animes_with_details").select(ANIME_CARD_SELECT).order("updated_at_kodik", { ascending: false }).limit(12),
    ]);
    
    // --- [ИЗМЕНЕНИЕ] Функция для обогащения данных статусами пользователя ---
    const enrichWithUserStatus = async (animeList: any[] | null) => {
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

    const responseData = {
      hero: heroAnimesResponse.data,
      trending: await enrichWithUserStatus(trending.data),
      popular: await enrichWithUserStatus(popular.data),
      latestUpdates: await enrichWithUserStatus(latestUpdates.data),
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error("Error fetching homepage sections:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
