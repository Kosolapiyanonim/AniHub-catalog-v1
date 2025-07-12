// /app/api/homepage-sections/route.ts

export const dynamic = 'force-dynamic';
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

const ANIME_CARD_SELECT = "id, shikimori_id, title, poster_url, year, shikimori_rating, episodes_count, type";
const HERO_ANIME_SELECT = `${ANIME_CARD_SELECT}, description`;

const getBestQuality = (translations: { quality: string | null }[]): string | null => {
  if (!translations || translations.length === 0) return null;
  const qualities = translations.map(t => t.quality).filter(Boolean) as string[];
  if (qualities.includes('FHD')) return 'FHD';
  if (qualities.includes('HD')) return 'HD';
  if (qualities.length > 0) return qualities[0];
  return null;
};

export async function GET() {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    const { data: { session } } = await supabase.auth.getSession();

    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const [
      heroAnimesResponse,
      trending,
      popular,
      recentlyCompleted,
      latestUpdates,
    ] = await Promise.all([
      supabase.from("animes").select(HERO_ANIME_SELECT).eq("is_featured_in_hero", true).not('shikimori_id', 'is', null).limit(10),
      supabase.from("animes_with_details").select(ANIME_CARD_SELECT).gte("updated_at_kodik", twoMonthsAgo.toISOString()).not('shikimori_id', 'is', null).order("weighted_rating", { ascending: false }).limit(12),
      supabase.from("animes").select(ANIME_CARD_SELECT).not('shikimori_id', 'is', null).order("shikimori_votes", { ascending: false }).limit(12),
      supabase.from("animes_with_details").select(ANIME_CARD_SELECT).eq("status", "released").gte("updated_at_kodik", oneMonthAgo.toISOString()).not('shikimori_id', 'is', null).order("weighted_rating", { ascending: false }).limit(12),
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
      const user = session.user;
      const [continueWatchingResponse, myUpdatesResponse] = await Promise.all([
          supabase.from("user_lists").select(`progress, animes!inner(${ANIME_CARD_SELECT})`).eq("user_id", user.id).eq("status", "watching").not('animes.shikimori_id', 'is', null).order("updated_at", { ascending: false }).limit(6),
          supabase.from("user_subscriptions").select(`animes!inner(${ANIME_CARD_SELECT})`).eq("user_id", user.id).not('animes.shikimori_id', 'is', null).order('created_at', { ascending: false }).limit(12)
      ]);
      continueWatching = continueWatchingResponse.data?.map(item => item.animes ? {...item.animes, progress: item.progress } : null).filter(Boolean) || [];
      myUpdates = myUpdatesResponse.data?.map(item => item.animes).filter(Boolean) || [];
    }
    
    const responseData = {
      hero: heroWithDetails,
      trending: trending.data,
      popular: popular.data,
      recentlyCompleted: recentlyCompleted.data,
      latestUpdates: latestUpdates.data,
      continueWatching,
      myUpdates,
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error("Error fetching homepage sections:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
