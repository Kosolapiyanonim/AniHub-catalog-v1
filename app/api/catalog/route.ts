// app/api/catalog/route.ts
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

/**
 * GET /api/catalog
 * Поддерживает пагинацию, сортировку и расширенные фильтры.
 *
 *  query params:
 *    page, limit, sort, order
 *    title
 *    genres (csv)
 *    status
 *    type   (csv)
 *    age_rating (csv)
 *    year_from, year_to
 *    episodes_from, episodes_to
 *    rating_from,  rating_to
 *    votes_from,   votes_to
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    /* ---------- базовые параметры ---------- */
    const page = Number.parseInt(searchParams.get("page") ?? "1")
    const limit = Number.parseInt(searchParams.get("limit") ?? "24")
    const offset = (page - 1) * limit

    const sort = searchParams.get("sort") ?? "shikimori_rating"
    const order = (searchParams.get("order") ?? "desc") === "asc"

    /* ---------- параметры фильтров ---------- */
    const title = searchParams.get("title") ?? ""

    const genres = searchParams.get("genres")?.split(",").filter(Boolean)

    const status = searchParams.get("status") ?? ""
    const type = searchParams.get("type")?.split(",").filter(Boolean)

    const ageRating = searchParams.get("age_rating")?.split(",").filter(Boolean)

    const yearFrom = searchParams.get("year_from")
    const yearTo = searchParams.get("year_to")
    const episodesFrom = searchParams.get("episodes_from")
    const episodesTo = searchParams.get("episodes_to")
    const ratingFrom = searchParams.get("rating_from")
    const ratingTo = searchParams.get("rating_to")
    const votesFrom = searchParams.get("votes_from")
    const votesTo = searchParams.get("votes_to")

    /* ---------- формируем запрос к Supabase ---------- */
    let query = supabase.from("animes_with_relations").select("*", { count: "exact" })

    if (title) {
      query = query.or(`title.ilike.%${title}%,title_orig.ilike.%${title}%`)
    }

    if (genres && genres.length) {
      query = query.contains("genres", genres)
    }

    if (status && status !== "any") {
      query = query.eq("status", status)
    }

    if (type && type.length) {
      query = query.in("type", type)
    }

    if (ageRating && ageRating.length) {
      query = query.in("age_rating", ageRating)
    }

    if (yearFrom) query = query.gte("year", Number(yearFrom))
    if (yearTo) query = query.lte("year", Number(yearTo))
    if (episodesFrom) query = query.gte("episodes_count", Number(episodesFrom))
    if (episodesTo) query = query.lte("episodes_count", Number(episodesTo))
    if (ratingFrom) query = query.gte("shikimori_rating", Number(ratingFrom))
    if (ratingTo) query = query.lte("shikimori_rating", Number(ratingTo))
    if (votesFrom) query = query.gte("shikimori_votes", Number(votesFrom))
    if (votesTo) query = query.lte("shikimori_votes", Number(votesTo))

    /* ---------- сортировка + пагинация ---------- */
    query = query.order(sort, { ascending: order }).range(offset, offset + limit - 1)

    const { data, count, error } = await query

    if (error) throw error

    return NextResponse.json({
      results: data ?? [],
      total: count ?? 0,
      hasMore: (count ?? 0) > offset + limit,
      page,
      limit,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Неизвестная ошибка сервера"
    console.error("❌ Catalog API error:", message)
    return NextResponse.json({ status: "error", message }, { status: 500 })
  }
}
