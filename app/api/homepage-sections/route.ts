// /app/api/homepage-sections/route.ts

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// Расширяем выборку для карточек и Hero
const ANIME_CARD_SELECT = "id, shikimori_id, title, poster_url, year, shikimori_rating, episodes_count, type";
const HERO_ANIME_SELECT = `${ANIME_CARD_SELECT}, description`;

// Функция для определения лучшего качества
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

    // --- ЗАПРАШИВАЕМ ОСНОВНЫЕ СЕКЦИИ ---
    const [
      heroAnimesResponse, // Сначала получаем базовые данные для Hero
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

    // --- ДОПОЛНЯЕМ HERO-СЕКЦИЮ ДАННЫМИ О КАЧЕСТВЕ ---
    let heroWithDetails = [];
    if (heroAnimesResponse.data) {
      const heroAnimeIds = heroAnimesResponse.data.map(a => a.id);
      
      // Один запрос для получения всех озвучек для всех аниме из Hero
      const { data: translations } = await supabase
        .from("translations")
        .select("anime_id, quality")
        .in("anime_id", heroAnimeIds);

      // Группируем озвучки по anime_id
      const translationsMap = new Map<number, { quality: string | null }[]>();
      if (translations) {
        for (const t of translations) {
          if (!translationsMap.has(t.anime_id)) {
            translationsMap.set(t.anime_id, []);
          }
          translationsMap.get(t.anime_id)!.push(t);
        }
      }

      // Добавляем лучшее качество к каждому аниме
      heroWithDetails = heroAnimesResponse.data.map(anime => ({
        ...anime,
        best_quality: getBestQuality(translationsMap.get(anime.id) || [])
      }));
    }

    // --- ПЕРСОНАЛЬНЫЕ СЕКЦИИ ---
    let continueWatching = null;
    let myUpdates = null;
    if (session) {
      // ... (логика персональных секций остается без изменений)
    }
    
    // --- СОБИРАЕМ ОТВЕТ ---
    const responseData = {
      hero: heroWithDetails, // Отдаем дополненные данные
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
