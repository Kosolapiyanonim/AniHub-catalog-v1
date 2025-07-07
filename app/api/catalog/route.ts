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
    const year = searchParams.get("year");
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const episodes = searchParams.get("episodes"); // 'short', 'standard', 'long'
    const title = searchParams.get("title");

    // Начинаем строить запрос
    let query = supabase.from("animes_with_relations").select("*", { count: "exact" });

    // --- Применяем все фильтры ---
    if (title) {
      query = query.or(`title.ilike.%${title}%,title_orig.ilike.%${title}%`);
    }
    if (genres && genres.length > 0) {
      query = query.contains("genres", genres);
    }
    if (studios && studios.length > 0) {
      query = query.contains("studios", studios);
    }
    if (year && year !== "all") {
      query = query.eq("year", Number.parseInt(year));
    }
    if (status && status !== "all") {
      query = query.eq("status", status);
    }
    if (type && type !== "all") {
      query = query.eq("type", type);
    }
    if (episodes && episodes !== "all") {
      if (episodes === 'short') { // 1-6 серий
        query = query.gte('episodes_count', 1).lte('episodes_count', 6);
      } else if (episodes === 'standard') { // 7-26 серий
        query = query.gte('episodes_count', 7).lte('episodes_count', 26);
      } else if (episodes === 'long') { // 27+ серий
        query = query.gte('episodes_count', 27);
      }
    }

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
      page,
      limit,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Неизвестная ошибка";
    console.error("❌ Catalog API error:", message);
    return NextResponse.json({ status: "error", message, results: [], total: 0 }, { status: 500 });
  }
}
