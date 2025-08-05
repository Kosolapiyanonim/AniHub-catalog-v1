import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = Number.parseInt(searchParams.get("page") || "1")
  const limit = Number.parseInt(searchParams.get("limit") || "24")
  const genre = searchParams.get("genre")
  const year = searchParams.get("year")
  const type = searchParams.get("type")
  const status = searchParams.get("status")
  const studio = searchParams.get("studio")
  const tag = searchParams.get("tag")
  const kind = searchParams.get("kind") // New filter for anime_kind
  const search = searchParams.get("search")
  const sort = searchParams.get("sort") || "shikimori_rating.desc"

  const supabase = createClient()
  const offset = (page - 1) * limit

  let query = supabase.from("anime").select(
    `
      id,
      shikimori_id,
      title,
      russian,
      poster_url,
      type,
      year,
      shikimori_rating,
      status,
      episodes_total,
      duration,
      rating_mpaa,
      kodik_id,
      anime_kind,
      user_anime_lists(status)
    `,
    { count: "exact" },
  )

  if (genre) {
    query = query.ilike("anime_genres.genres.name", `%${genre}%`)
  }
  if (year) {
    query = query.eq("year", Number.parseInt(year))
  }
  if (type) {
    query = query.eq("type", type)
  }
  if (status) {
    query = query.eq("status", status)
  }
  if (studio) {
    query = query.ilike("anime_studios.studios.name", `%${studio}%`)
  }
  if (tag) {
    query = query.ilike("anime_tags.tags.name", `%${tag}%`)
  }
  if (kind) {
    // Apply new filter
    query = query.eq("anime_kind", kind)
  }
  if (search) {
    query = query.ilike("title", `%${search}%`)
  }

  // Apply sorting
  const [sortBy, sortOrder] = sort.split(".")
  query = query.order(sortBy, { ascending: sortOrder === "asc" })

  const { data: anime, error, count } = await query.range(offset, offset + limit - 1)

  if (error) {
    console.error("Error fetching catalog:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Flatten the user_anime_lists to get the status directly for each anime
  const formattedAnime = anime.map((item) => {
    const user_list_status = item.user_anime_lists?.[0]?.status || null
    const newItem = { ...item, user_list_status }
    delete newItem.user_anime_lists
    return newItem
  })

  return NextResponse.json({
    data: formattedAnime,
    count,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  })
}
