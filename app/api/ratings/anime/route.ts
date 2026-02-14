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

  if (animeIdParam) {
    const animeId = Number.parseInt(animeIdParam, 10)
    if (Number.isNaN(animeId)) {
      return NextResponse.json({ error: "anime_id must be a number" }, { status: 400, headers: response.headers })
    }

    const { data, error } = await supabase
      .from("user_anime_ratings")
      .select("rating, updated_at")
      .eq("user_id", user.id)
      .eq("anime_id", animeId)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500, headers: response.headers })
    }

    return NextResponse.json({ rating: data?.rating ?? null, updated_at: data?.updated_at ?? null }, { headers: response.headers })
  }

  const { data, error } = await supabase
    .from("user_anime_ratings")
    .select("anime_id, rating, updated_at, animes(id, shikimori_id, title, poster_url, year)")
    .eq("user_id", user.id)
    .order("rating", { ascending: false })
    .order("updated_at", { ascending: false })

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

  const { anime_id, rating } = await request.json()

  if (!anime_id) {
    return NextResponse.json({ error: "anime_id is required" }, { status: 400, headers: response.headers })
  }

  if (rating == null) {
    const { error } = await supabase.from("user_anime_ratings").delete().match({ user_id: user.id, anime_id })
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500, headers: response.headers })
    }
    return NextResponse.json({ message: "Rating removed" }, { headers: response.headers })
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 10) {
    return NextResponse.json({ error: "rating must be an integer between 1 and 10" }, { status: 400, headers: response.headers })
  }

  const { error } = await supabase.from("user_anime_ratings").upsert(
    {
      user_id: user.id,
      anime_id,
      rating,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,anime_id" },
  )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: response.headers })
  }

  return NextResponse.json({ message: "Rating saved" }, { headers: response.headers })
}
