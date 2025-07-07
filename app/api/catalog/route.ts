// Замените содержимое файла: /app/api/catalog/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // ... (все старые параметры остаются)
    const tags = searchParams.get("tags")?.split(",").filter(Boolean);
    const genres = searchParams.get("genres")?.split(",").filter(Boolean);
    // ...

    let query = supabase.from("animes_with_relations").select("*", { count: "exact" });

    // ... (все старые фильтры остаются)
    if (genres && genres.length > 0) query = query.contains("genres", genres);
    if (tags && tags.length > 0) query = query.contains("tags", tags);
    // ...

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
