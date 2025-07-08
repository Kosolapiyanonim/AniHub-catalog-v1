import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Параметры пагинации и сортировки
    const page = Number.parseInt(searchParams.get("page") ?? "1")
    const limit = Number.parseInt(searchParams.get("limit") ?? "24")
    const offset = (page - 1) * limit
    const sort = searchParams.get("sort") ?? "shikimori_rating"
    const order = (searchParams.get("order") ?? "desc") === "asc"

    // Параметры фильтров
    const title = searchParams.get("title") ?? ""
    const type = searchParams.get("type")?.split(",").filter(Boolean)
    const yearFrom = searchParams.get("yearFrom")
    const yearTo = searchParams.get("yearTo")

    // Формируем запрос к Supabase - выбираем только нужные поля
    let query = supabase.from("animes").select(`id, shikimori_id, title, poster_url, year, type`, { count: "exact" })

    if (title) {
      query = query.or(`title.ilike.%${title}%,title_orig.ilike.%${title}%`)
    }
    if (type && type.length) {
      query = query.in("type", type)
    }
    if (yearFrom) query = query.gte("year", Number(yearFrom))
    if (yearTo) query = query.lte("year", Number(yearTo))

    query = query.order(sort, { ascending: order }).range(offset, offset + limit - 1)

    const { data, count, error } = await query

    if (error) throw error

    return NextResponse.json({
      results: data ?? [],
      total: count ?? 0,
      hasMore: (count ?? 0) > offset + limit,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Неизвестная ошибка сервера"
    console.error("❌ Catalog API error:", message)
    return NextResponse.json({ status: "error", message }, { status: 500 })
  }
}
