import { NextRequest, NextResponse } from "next/server";
import createClient from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { revalidateTag } from "next/cache";

type HeroSlidePayload = {
  animeId: number;
  position: number;
  customImageUrl?: string | null;
};

// GET - получить список аниме для Hero-секции
export async function GET() {
  const supabase = await createClient();

  try {
    const { data: heroAnimes, error: heroError } = await supabase
      .from("animes")
      .select(
        "id, shikimori_id, title, poster_url, shikimori_rating, shikimori_votes, is_featured_in_hero, hero_position, hero_custom_image_url"
      )
      .eq("is_featured_in_hero", true)
      .order("hero_position", { ascending: true, nullsFirst: false })
      .order("shikimori_rating", { ascending: false, nullsFirst: false })
      .limit(20);

    if (heroError) {
      console.error("Ошибка при получении Hero-аниме:", heroError);
      return NextResponse.json({ error: heroError.message }, { status: 500 });
    }

    const { data: popularAnimes, error: popularError } = await supabase
      .from("animes")
      .select(
        "id, shikimori_id, title, poster_url, shikimori_rating, shikimori_votes, is_featured_in_hero, hero_position, hero_custom_image_url"
      )
      .not("shikimori_id", "is", null)
      .not("poster_url", "is", null)
      .order("shikimori_rating", { ascending: false, nullsFirst: false })
      .limit(100);

    if (popularError) {
      console.error("Ошибка при получении популярных аниме:", popularError);
    }

    return NextResponse.json({
      heroAnimes: heroAnimes || [],
      popularAnimes: popularAnimes || [],
    });
  } catch (error) {
    console.error("Ошибка в GET /api/admin/hero:", error);
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}

// POST - обновить список аниме для Hero-секции
export async function POST(request: NextRequest) {
  await createClient();

  try {
    const body = await request.json();
    const { animeIds, action, slides } = body;

    if (action !== "add" && action !== "remove" && action !== "set") {
      return NextResponse.json({ error: "action должен быть 'add', 'remove' или 'set'" }, { status: 400 });
    }

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ error: "Переменные окружения не настроены" }, { status: 500 });
    }

    const serviceSupabase = createServiceClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    if (action === "set") {
      if (!Array.isArray(slides)) {
        return NextResponse.json({ error: "slides должен быть массивом" }, { status: 400 });
      }

      const normalizedSlides = slides
        .filter((slide: HeroSlidePayload) => slide && Number.isInteger(slide.animeId))
        .slice(0, 10)
        .map((slide: HeroSlidePayload, index: number) => ({
          animeId: slide.animeId,
          position: Number.isFinite(slide.position) ? Number(slide.position) : index + 1,
          customImageUrl: slide.customImageUrl?.trim() || null,
        }))
        .sort((a: HeroSlidePayload, b: HeroSlidePayload) => a.position - b.position)
        .map((slide: HeroSlidePayload, index: number) => ({
          ...slide,
          position: index + 1,
        }));

      const { error: resetError } = await serviceSupabase
        .from("animes")
        .update({ is_featured_in_hero: false, hero_position: null, hero_custom_image_url: null })
        .eq("is_featured_in_hero", true);

      if (resetError) {
        console.error("Ошибка при сбросе Hero-аниме:", resetError);
        return NextResponse.json({ error: resetError.message }, { status: 500 });
      }

      for (const slide of normalizedSlides) {
        const { error: updateError } = await serviceSupabase
          .from("animes")
          .update({
            is_featured_in_hero: true,
            hero_position: slide.position,
            hero_custom_image_url: slide.customImageUrl,
          })
          .eq("id", slide.animeId);

        if (updateError) {
          console.error("Ошибка при установке Hero-аниме:", updateError);
          return NextResponse.json({ error: updateError.message }, { status: 500 });
        }
      }
    } else {
      if (!Array.isArray(animeIds)) {
        return NextResponse.json({ error: "animeIds должен быть массивом" }, { status: 400 });
      }

      if (action === "add") {
        const { error: updateError } = await serviceSupabase
          .from("animes")
          .update({ is_featured_in_hero: true })
          .in("id", animeIds);

        if (updateError) {
          console.error("Ошибка при добавлении Hero-аниме:", updateError);
          return NextResponse.json({ error: updateError.message }, { status: 500 });
        }
      }

      if (action === "remove") {
        const { error: updateError } = await serviceSupabase
          .from("animes")
          .update({ is_featured_in_hero: false, hero_position: null, hero_custom_image_url: null })
          .in("id", animeIds);

        if (updateError) {
          console.error("Ошибка при удалении Hero-аниме:", updateError);
          return NextResponse.json({ error: updateError.message }, { status: 500 });
        }
      }
    }

    revalidateTag("homepage");
    revalidateTag("homepage:hero");

    return NextResponse.json({
      success: true,
      message: `Аниме успешно ${action === "add" ? "добавлены" : action === "remove" ? "удалены" : "обновлены"}`,
    });
  } catch (error) {
    console.error("Ошибка в POST /api/admin/hero:", error);
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}
