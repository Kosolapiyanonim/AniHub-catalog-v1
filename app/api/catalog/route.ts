// Замените содержимое файла: /app/api/catalog/route.ts

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // --- Параметры для пагинации и сортировки ---
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "24");
    const offset = (page - 1) * limit;
    const sort = searchParams.get("sort") || "shikimori_rating";
    const order = searchParams.get("order") || "desc";

    // --- Новые параметры для фильтрации ---
    const genres = searchParams.get("genres")?.split(",").filter(Boolean);
    const studios = searchParams.get("studios")?.split(",").filter(Boolean);
    const yearFrom = searchParams.get("yearFrom");
    const yearTo = searchParams.get("yearTo");
    const episodesFrom = searchParams.get("episodesFrom");
    const episodesTo = searchParams.get("episodesTo");
    const ratingFrom = searchParams.get("ratingFrom");
    const ratingTo = searchParams.get("ratingTo");
    const status = searchParams.get("status");
    const type = searchParams.get("type")?.split(",").filter(Boolean);
    const title = searchParams.get("title");

    let query = supabase.from("animes_with_relations").select("*", { count: "exact" });

    // --- Применяем все фильтры ---
    if (title) query = query.or(`title.ilike.%${title}%,title_orig.ilike.%${title}%`);
    if (genres && genres.length > 0) query = query.contains("genres", genres);
    if (studios && studios.length > 0) query = query.contains("studios", studios);
    if (status && status !== "all") query = query.eq("status", status);
    if (type && type.length > 0) query = query.in("type", type);

    // Фильтры по диапазонам
    if (yearFrom) query = query.gte('year', Number.parseInt(yearFrom));
    if (yearTo) query = query.lte('year', Number.parseInt(yearTo));
    if (episodesFrom) query = query.gte('episodes_count', Number.parseInt(episodesFrom));
    if (episodesTo) query = query.lte('episodes_count', Number.parseInt(episodesTo));
    if (ratingFrom) query = query.gte('shikimori_rating', Number.parseFloat(ratingFrom));
    if (ratingTo) query = query.lte('shikimori_rating', Number.parseFloat(ratingTo));

    // Применяем сортировку и пагинацию
    query = query.order(sort, { ascending: order === "asc" }).range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("❌ Supabase error in catalog:", error);
      throw error;
    }

    return NextResponse.json({
      results: data || [],
      total: count || 0,
      hasMore: (count || 0) > offset + limit,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Неизвестная ошибка";
    console.error("❌ Catalog API error:", message);
    return NextResponse.json({ status: "error", message, results: [], total: 0 }, { status: 500 });
  }
}
