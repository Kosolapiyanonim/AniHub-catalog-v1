// /app/api/homepage-sections/route.ts

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Эта строка принудительно отключает кэширование для данного API-роута.
export const dynamic = 'force-dynamic';

const ANIME_CARD_SELECT = "id, shikimori_id, title, poster_url, year, shikimori_rating, episodes_count";
const HERO_ANIME_SELECT = `${ANIME_CARD_SELECT}, description`;

export async function GET() {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    const { data: { session } } = await supabase.auth.getSession();

    const [
      hero,
      trending,
      popular,
      recentlyCompleted,
      latestUpdates,
    ] = await Promise.all([
      supabase.from("animes").select(HERO_ANIME_SELECT).eq("is_featured_in_hero", true).limit(5),
      supabase.from("animes").select(ANIME_CARD_SELECT).gte("year", new Date().getFullYear() - 1).order("shikimori_votes", { ascending: false }).limit(12),
      supabase.from("animes").select(ANIME_CARD_SELECT).order("shikimori_votes", { ascending: false }).limit(12),
      supabase.from("animes").select(ANIME_CARD_SELECT).eq("status", "released").order("updated_at_kodik", { ascending: false }).limit(12),
      supabase.from("animes").select(ANIME_CARD_SELECT).order("updated_at_kodik", { ascending: false }).limit(12),
    ]);

    let continueWatching = null;
    let myUpdates = null;

    if (session) {
      const [continueWatchingResponse, myUpdatesResponse] = await Promise.all([
        supabase.from("user_lists").select(`progress, animes(${ANIME_CARD_SELECT})`).eq("user_id", session.user.id).eq("status", "watching").order("updated_at", { ascending: false }).limit(6),
        supabase.from("user_subscriptions").select(`animes(${ANIME_CARD_SELECT})`).eq("user_id", session.user.id).order('created_at', { ascending: false }).limit(12)
      ]);
      
      continueWatching = continueWatchingResponse.data?.map(item => ({...item.animes, progress: item.progress })) || [];
      myUpdates = myUpdatesResponse.data?.map(item => item.animes) || [];
    }
    
    const responseData = {
      hero: hero.data,
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
    if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
  }
}
