import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "24")
    const offset = (page - 1) * limit
    const sort = searchParams.get("sort") || "shikimori_rating"
    const order = searchParams.get("order") || "desc"
    const genres = searchParams.get("genres")?.split(",").filter(Boolean)
    const year = searchParams.get("year")
    const status = searchParams.get("status")?.split(",").filter(Boolean)
    const title = searchParams.get("title")

    console.log("🔍 Catalog API params:", {
      page,
      limit,
      sort,
      order,
      genres,
      year,
      status,
      title,
    })

    let query = supabase.from("animes_with_relations").select("*", { count: "exact" })

    // Фильтры
    if (title) {
      query = query.or(`title.ilike.%${title}%,title_orig.ilike.%${title}%`)
    }

    if (genres && genres.length > 0 && !genres.includes("all")) {
      query = query.contains("genres", genres)
    }

    if (year && year !== "all") {
      query = query.eq("year", Number.parseInt(year))
    }

    if (status && status.length > 0 && !status.includes("all")) {
      query = query.in("status", status)
    }

    // Сортировка и пагинация
    query = query.order(sort, { ascending: order === "asc" }).range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error("❌ Supabase error:", error)
      throw error
    }

    console.log(`✅ Found ${data?.length || 0} results out of ${count || 0} total`)

    return NextResponse.json({
      results: data || [],
      total: count || 0,
      hasMore: (count || 0) > offset + limit,
      page,
      limit,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Неизвестная ошибка"
    console.error("❌ Catalog API error:", message)
    return NextResponse.json({ status: "error", message, results: [], total: 0 }, { status: 500 })
  }
}
