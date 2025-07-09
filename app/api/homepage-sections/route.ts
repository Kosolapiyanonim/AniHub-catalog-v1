// /app/api/homepage-sections/route.ts

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Определяем, какие поля нам нужны для карточки аниме, чтобы не запрашивать лишнего
const ANIME_CARD_SELECT = "id, shikimori_id, title, poster_url, year, shikimori_rating, episodes_count";

export async function GET() {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    // Получаем сессию пользователя, чтобы знать, нужно ли загружать персональные блоки
    const { data: { session } } = await supabase.auth.getSession();

    // --- ЗАПРАШИВАЕМ ВСЕ СЕКЦИИ ПАРАЛЛЕЛЬНО ДЛЯ МАКСИМАЛЬНОЙ СКОРОСТИ ---
    
    const [
      hero,
      trending,
      popular,
      recentlyCompleted,
      latestUpdates,
    ] = await Promise.all([
      // 1. Hero секция (аниме, отмеченные в админке)
      supabase.from("animes").select(ANIME_CARD_SELECT).eq("is_featured_in_hero", true).limit(5),
      
      // 2. Трендовые (популярные за последние 2 года)
      supabase.from("animes").select(ANIME_CARD_SELECT).gte("year", new Date().getFullYear() - 1).order("shikimori_votes", { ascending: false }).limit(12),
      
      // 3. Самые популярные (за все время)
      supabase.from("animes").select(ANIME_CARD_SELECT).order("shikimori_votes", { ascending: false }).limit(12),
      
      // 4. Последние оконченные
      supabase.from("animes").select(ANIME_CARD_SELECT).eq("status", "released").order("updated_at_kodik", { ascending: false }).limit(12),
      
      // 5. Последние обновления (все подряд)
      supabase.from("animes").select(ANIME_CARD_SELECT).order("updated_at_kodik", { ascending: false }).limit(12),
    ]);

    // --- ПЕРСОНАЛЬНЫЕ СЕКЦИИ (ЗАПРАШИВАЮТСЯ ТОЛЬКО ЕСЛИ ПОЛЬЗОВАТЕЛЬ АВТОРИЗОВАН) ---

    let continueWatching = null;
    let myUpdates = null;

    if (session) {
      const [continueWatchingResponse, myUpdatesResponse] = await Promise.all([
        // 6. Продолжить просмотр
        supabase.from("user_lists").select(`progress, animes(${ANIME_CARD_SELECT})`).eq("user_id", session.user.id).eq("status", "watching").order("updated_at", { ascending: false }).limit(6),
        
        // 7. Мои обновления (аниме, на которые подписан пользователь)
        supabase.from("user_subscriptions").select(`animes(${ANIME_CARD_SELECT})`).eq("user_id", session.user.id).order('created_at', { ascending: false }).limit(12)
      ]);
      
      // Форматируем данные, чтобы было удобно использовать на фронтенде
      continueWatching = continueWatchingResponse.data?.map(item => ({...item.animes, progress: item.progress })) || [];
      myUpdates = myUpdatesResponse.data?.map(item => item.animes) || [];
    }
    
    // --- СОБИРАЕМ ВСЕ В ОДИН ОТВЕТ ---

    const responseData = {
      hero: hero.data,
      trending: trending.data,
      popular: popular.data,
      recentlyCompleted: recentlyCompleted.data,
      latestUpdates: latestUpdates.data,
      // Персональные блоки будут null, если пользователь не вошел
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
