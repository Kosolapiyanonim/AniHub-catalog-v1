import { NextResponse } from "next/server"
import { createClientForRouteHandler, getAuthenticatedUser } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const response = new NextResponse()
  const supabase = await createClientForRouteHandler(response)
  const user = await getAuthenticatedUser(supabase)

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: response.headers })
  }

  const { searchParams } = new URL(request.url)
  const animeIdParam = searchParams.get("anime_id")
  const favoritesOnly = searchParams.get("favorites") === "1"

  let query = supabase
    .from("user_episode_ratings")
    .select("anime_id, episode_number, rating, is_favorite, updated_at, animes(id, shikimori_id, title, poster_url)")
    .eq("user_id", user.id)
    .order("rating", { ascending: false })
    .order("updated_at", { ascending: false })

  if (favoritesOnly) query = query.eq("is_favorite", true)

  if (animeIdParam) {
    const animeId = Number.parseInt(animeIdParam, 10)
    if (Number.isNaN(animeId)) {
      return NextResponse.json({ error: "anime_id must be a number" }, { status: 400, headers: response.headers })
    }
    query = query.eq("anime_id", animeId)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: response.headers })
  }

  return NextResponse.json({ items: data ?? [] }, { headers: response.headers })
}

export async function POST(request: Request) {
  const response = new NextResponse()
  const supabase = await createClientForRouteHandler(response)
  const user = await getAuthenticatedUser(supabase)

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: response.headers })
  }

  const { anime_id, episode_number, rating, is_favorite } = await request.json()

  if (!anime_id || !episode_number) {
    return NextResponse.json({ error: "anime_id and episode_number are required" }, { status: 400, headers: response.headers })
  }

  if (!Number.isInteger(episode_number) || episode_number < 1) {
    return NextResponse.json({ error: "episode_number must be a positive integer" }, { status: 400, headers: response.headers })
  }

  const favoriteValue = Boolean(is_favorite)

  if (rating == null && !favoriteValue) {
    const { error } = await supabase
      .from("user_episode_ratings")
      .delete()
      .match({ user_id: user.id, anime_id, episode_number })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500, headers: response.headers })
    }

    return NextResponse.json({ message: "Episode rating removed" }, { headers: response.headers })
  }

  if (rating != null && (!Number.isInteger(rating) || rating < 1 || rating > 10)) {
    return NextResponse.json({ error: "rating must be an integer between 1 and 10" }, { status: 400, headers: response.headers })
  }

  const { error } = await supabase.from("user_episode_ratings").upsert(
    {
      user_id: user.id,
      anime_id,
      episode_number,
      rating: rating ?? 1,
      is_favorite: favoriteValue,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,anime_id,episode_number" },
  )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: response.headers })
  }

  return NextResponse.json({ message: "Episode rating saved" }, { headers: response.headers })
}
