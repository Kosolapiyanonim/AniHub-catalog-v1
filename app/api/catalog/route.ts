import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Параметры пагинации
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "24")
    const offset = (page - 1) * limit

    // Параметры сортировки
    const sort = searchParams.get("sort") || "shikimori_rating"
    const order = searchParams.get("order") || "desc"

    // Параметры фильтрации
    const title = searchParams.get("title")
    const genres = searchParams.get("genres")
    const yearFrom = searchParams.get("year_from")
    const yearTo = searchParams.get("year_to")
    const episodesFrom = searchParams.get("episodes_from")
    const episodesTo = searchParams.get("episodes_to")
    const ratingFrom = searchParams.get("rating_from")
    const ratingTo = searchParams.get("rating_to")
    const votesFrom = searchParams.get("votes_from")
    const votesTo = searchParams.get("votes_to")
    const status = searchParams.get("status")
    const type = searchParams.get("type")
    const ageRating = searchParams.get("age_rating")

    // Строим запрос
    let query = supabase.from("anime").select("*", { count: "exact" })

    // Применяем фильтры
    if (title) {
      query = query.ilike("title", `%${title}%`)
    }

    if (genres && genres !== "any") {
      query = query.contains("genres", [genres])
    }

    if (yearFrom) {
      query = query.gte("year", Number.parseInt(yearFrom))
    }

    if (yearTo) {
      query = query.lte("year", Number.parseInt(yearTo))
    }

    if (episodesFrom) {
      query = query.gte("episodes_count", Number.parseInt(episodesFrom))
    }

    if (episodesTo) {
      query = query.lte("episodes_count", Number.parseInt(episodesTo))
    }

    if (ratingFrom) {
      query = query.gte("shikimori_rating", Number.parseFloat(ratingFrom))
    }

    if (ratingTo) {
      query = query.lte("shikimori_rating", Number.parseFloat(ratingTo))
    }

    if (votesFrom) {
      query = query.gte("shikimori_votes", Number.parseInt(votesFrom))
    }

    if (votesTo) {
      query = query.lte("shikimori_votes", Number.parseInt(votesTo))
    }

    if (status && status !== "any") {
      query = query.eq("status", status)
    }

    if (type) {
      const types = type.split(",")
      query = query.in("type", types)
    }

    if (ageRating) {
      const ratings = ageRating.split(",")
      query = query.in("age_rating", ratings)
    }

    // Применяем сортировку
    query = query.order(sort, { ascending: order === "asc" })

    // Применяем пагинацию
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    const hasMore = count ? offset + limit < count : false

    return NextResponse.json({
      results: data || [],
      total: count || 0,
      hasMore,
      page,
      limit,
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
