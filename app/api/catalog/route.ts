import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = Number.parseInt(searchParams.get("page") || "1")
  const limit = Number.parseInt(searchParams.get("limit") || "24")
  const genres = searchParams.get("genres")?.split(",") || []
  const years = searchParams.get("years")?.split(",") || []
  const statuses = searchParams.get("statuses")?.split(",") || []
  const types = searchParams.get("types")?.split(",") || []
  const studios = searchParams.get("studios")?.split(",") || []
  const tags = searchParams.get("tags")?.split(",") || []
  const search = searchParams.get("search") || ""
  const sort = searchParams.get("sort") || "shikimori_rating"
  const order = searchParams.get("order") || "desc"
  const animeKind = searchParams.get("anime_kind") || "" // New filter parameter

  const offset = (page - 1) * limit
  const supabase = createClient()

  try {
    let query = supabase.from("anime").select("*", { count: "exact" })

    if (search) {
      query = query.ilike("title", `%${search}%`)
    }

    if (genres.length > 0) {
      query = query.contains("genres", genres)
    }
    if (years.length > 0) {
      query = query.in("year", years.map(Number))
    }
    if (statuses.length > 0) {
      query = query.in("status", statuses)
    }
    if (types.length > 0) {
      query = query.in("type", types)
    }
    if (studios.length > 0) {
      query = query.contains("studios", studios)
    }
    if (tags.length > 0) {
      query = query.contains("tags", tags)
    }
    if (animeKind) {
      query = query.eq("anime_kind", animeKind) // Apply new filter
    }

    query = query.order(sort, { ascending: order === "asc" })
    query = query.range(offset, offset + limit - 1)

    const { data: anime, error, count } = await query

    if (error) {
      console.error("Error fetching catalog:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ anime, total: count })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
