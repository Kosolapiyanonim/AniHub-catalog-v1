// /app/api/catalog/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "24");
    const offset = (page - 1) * limit;
    const sort = searchParams.get("sort") || "shikimori_rating";
    const order = searchParams.get("order") || "desc";

    const genres = searchParams.get("genres")?.split(',');
    const title = searchParams.get("title");

    let query = supabase.from("animes_with_relations").select("*", { count: "exact" });

    if (title) query = query.ilike("title", `%${title}%`);
    if (genres && genres.length > 0 && !genres.includes('all')) {
      // @ts-ignore
      query = query.contains("genres", genres);
    }
    
    query = query.order(sort, { ascending: order === "asc" }).range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return NextResponse.json({ results: data, total: count });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Неизвестная ошибка";
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
}
