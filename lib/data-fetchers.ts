// lib/data-fetchers.ts
import { unstable_cache } from "next/cache";

import createClient from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { SupabaseClient, User } from "@supabase/supabase-js";

const ANIME_CARD_SELECT = `
    id, shikimori_id, title, poster_url, year, type, status,
    episodes_aired, episodes_total, shikimori_rating, description,
    genres:anime_genres(genres(id, name, slug))
`;

const HERO_ANIME_SELECT = `
    id, shikimori_id, title, poster_url, screenshots, year, description,
    shikimori_rating, episodes_aired, episodes_total, status, type,
    genres:anime_genres(genres(name))
`;

type HomepageStage = "hero_critical" | "sections_deferred" | "user_enrichment" | "homepage_full";

const toErrorDetails = (error: unknown) => {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack?.split("\n").slice(0, 3).join("\n"),
    };
  }

  return {
    name: "UnknownError",
    message: typeof error === "string" ? error : JSON.stringify(error),
  };
};


const createReadonlySupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY for readonly homepage fetch");
  }

  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
};

const createHomepageLogger = (stage: HomepageStage) => {
  const startedAt = Date.now();
  const traceId = `hp_${stage}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const info = (message: string, meta: Record<string, unknown> = {}) => {
    console.log("[HOMEPAGE][INFO]", {
      traceId,
      stage,
      elapsedMs: Date.now() - startedAt,
      message,
      ...meta,
    });
  };

  const error = (message: string, err: unknown, meta: Record<string, unknown> = {}) => {
    console.error("[HOMEPAGE][ERROR]", {
      traceId,
      stage,
      elapsedMs: Date.now() - startedAt,
      message,
      error: toErrorDetails(err),
      ...meta,
    });
  };

  return { info, error };
};

const enrichWithUserStatus = async (supabase: SupabaseClient, user: User | null, animeList: any[] | null) => {
  const logger = createHomepageLogger("user_enrichment");

  if (!user || !animeList || animeList.length === 0) {
    logger.info("Пропущено обогащение user status", {
      reason: !user ? "no_user" : "empty_anime_list",
      inputSize: animeList?.length ?? 0,
    });
    return animeList;
  }

  try {
    const animeIds = animeList.map((anime) => anime.id);
    const { data: userListsData, error: userListsError } = await supabase
      .from("user_lists")
      .select("anime_id, status")
      .eq("user_id", user.id)
      .in("anime_id", animeIds);

    if (userListsError) {
      logger.error("Ошибка запроса user_lists", userListsError, {
        userId: user.id,
        animeIdsCount: animeIds.length,
      });
      return animeList;
    }

    if (!userListsData) {
      logger.info("user_lists вернул пустой ответ", { userId: user.id, animeIdsCount: animeIds.length });
      return animeList;
    }

    const statusMap = new Map(userListsData.map((item) => [item.anime_id, item.status]));
    const enriched = animeList.map((anime) => ({
      ...anime,
      user_list_status: statusMap.get(anime.id) || null,
    }));

    logger.info("User status успешно добавлен", {
      userId: user.id,
      sourceSize: animeList.length,
      statusesFound: userListsData.length,
    });

    return enriched;
  } catch (error) {
    logger.error("Непредвиденная ошибка в enrichWithUserStatus", error, {
      userId: user.id,
      inputSize: animeList.length,
    });
    return animeList;
  }
};

const mapHeroData = (heroRows: any[] | null) =>
  heroRows?.map((anime) => ({
    ...anime,
    genres: anime.genres.map((g: any) => g.genres.name),
    background_image_url: anime.screenshots && anime.screenshots.length > 0 ? anime.screenshots[0] : anime.poster_url,
  })) || [];

const mapCarouselData = (rows: any[] | null) =>
  rows?.map((anime: any) => ({
    ...anime,
    genres: anime.genres.map((g: any) => g.genres).filter(Boolean),
  })) || [];

const getHomepageHeroCriticalDataCached = unstable_cache(
  async () => {
    const logger = createHomepageLogger("hero_critical");

    try {
      const supabase = createReadonlySupabaseClient();
      const { data, error } = await supabase
        .from("animes")
        .select(HERO_ANIME_SELECT)
        .eq("is_featured_in_hero", true)
        .limit(10);

      if (error) {
        logger.error("Ошибка загрузки hero-секции", error);
        return [];
      }

      let mapped = mapHeroData(data);

      if (mapped.length === 0) {
        logger.info("Не найдено аниме с is_featured_in_hero=true, включаем fallback", { fallback: "top_rated" });

        const { data: fallbackData, error: fallbackError } = await supabase
          .from("animes")
          .select(HERO_ANIME_SELECT)
          .order("shikimori_rating", { ascending: false, nullsFirst: false })
          .limit(10);

        if (fallbackError) {
          logger.error("Ошибка fallback-запроса hero", fallbackError);
          return [];
        }

        mapped = mapHeroData(fallbackData);
      }

      logger.info("Hero-данные загружены", { itemsCount: mapped.length });
      return mapped;
    } catch (error) {
      logger.error("Критическая ошибка загрузки hero", error);
      return [];
    }
  },
  ["homepage-hero-critical"],
  { revalidate: 300, tags: ["homepage", "homepage:hero"] },
);

const getHomepageSecondarySectionsCached = unstable_cache(
  async () => {
    const logger = createHomepageLogger("sections_deferred");

    try {
      const supabase = createReadonlySupabaseClient();
      const [trendingResponse, popularResponse, latestUpdatesResponse] = await Promise.all([
        supabase.from("animes").select(ANIME_CARD_SELECT).order("shikimori_rating", { ascending: false, nullsFirst: false }).limit(12),
        supabase.from("animes").select(ANIME_CARD_SELECT).order("shikimori_votes", { ascending: false, nullsFirst: false }).limit(12),
        supabase.from("animes").select(ANIME_CARD_SELECT).order("updated_at_kodik", { ascending: false, nullsFirst: false }).limit(12),
      ]);

      if (trendingResponse.error) logger.error("Ошибка секции trending", trendingResponse.error);
      if (popularResponse.error) logger.error("Ошибка секции popular", popularResponse.error);
      if (latestUpdatesResponse.error) logger.error("Ошибка секции latestUpdates", latestUpdatesResponse.error);

      const mapped = {
        trending: mapCarouselData(trendingResponse.data),
        popular: mapCarouselData(popularResponse.data),
        latestUpdates: mapCarouselData(latestUpdatesResponse.data),
      };

      logger.info("Вторичные секции загружены", {
        trendingCount: mapped.trending.length,
        popularCount: mapped.popular.length,
        latestUpdatesCount: mapped.latestUpdates.length,
      });

      return mapped;
    } catch (error) {
      logger.error("Критическая ошибка загрузки вторичных секций", error);
      return {
        trending: [],
        popular: [],
        latestUpdates: [],
      };
    }
  },
  ["homepage-secondary-sections"],
  { revalidate: 300, tags: ["homepage", "homepage:sections"] },
);

export async function getHomePageData() {
  const logger = createHomepageLogger("homepage_full");

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) logger.error("Ошибка получения пользователя", userError);

    const hero = await getHomepageHeroCriticalDataCached();
    const secondary = await getHomepageSecondarySectionsCached();

    const result = {
      hero: await enrichWithUserStatus(supabase, user, hero),
      trending: await enrichWithUserStatus(supabase, user, secondary.trending),
      popular: await enrichWithUserStatus(supabase, user, secondary.popular),
      latestUpdates: await enrichWithUserStatus(supabase, user, secondary.latestUpdates),
    };

    logger.info("Полный набор данных главной страницы готов", {
      hasUser: Boolean(user),
      heroCount: result.hero?.length ?? 0,
      trendingCount: result.trending?.length ?? 0,
      popularCount: result.popular?.length ?? 0,
      latestUpdatesCount: result.latestUpdates?.length ?? 0,
    });

    return result;
  } catch (error) {
    logger.error("Ошибка при загрузке данных для главной страницы", error);
    return { hero: [], trending: [], popular: [], latestUpdates: [] };
  }
}

export async function getHomepageHeroCriticalData() {
  return getHomepageHeroCriticalDataCached();
}

export async function getHomepageSectionsDeferred() {
  return getHomepageSecondarySectionsCached();
}

export async function getHomepageSections() {
  const [hero, sections] = await Promise.all([getHomepageHeroCriticalDataCached(), getHomepageSecondarySectionsCached()]);
  return { hero, ...sections };
}
