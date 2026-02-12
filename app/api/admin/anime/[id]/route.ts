import { NextRequest, NextResponse } from "next/server"
import { createClientForRouteHandler, getAuthenticatedUser } from "@/lib/supabase/server"
import { getUserRole, isManagerOrHigher } from "@/lib/role-utils"

export const dynamic = "force-dynamic"

// GET - получить данные аниме для редактирования
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const response = new NextResponse()
  const supabase = await createClientForRouteHandler(response)
  const user = await getAuthenticatedUser(supabase)

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: response.headers })
  }

  const userRole = await getUserRole(supabase, user.id)
  if (!isManagerOrHigher(userRole)) {
    return NextResponse.json({ error: "Forbidden: Admin or manager access required" }, { status: 403, headers: response.headers })
  }

  const animeId = parseInt(params.id)
  if (isNaN(animeId)) {
    return NextResponse.json({ error: "Invalid anime ID" }, { status: 400, headers: response.headers })
  }

  try {
    const { data: anime, error } = await supabase
      .from("animes")
      .select("*")
      .eq("id", animeId)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Anime not found" }, { status: 404, headers: response.headers })
      }
      throw error
    }

    return NextResponse.json(anime, { headers: response.headers })
  } catch (error) {
    console.error("Error fetching anime:", error)
    return NextResponse.json(
      { error: "Failed to fetch anime" },
      { status: 500, headers: response.headers }
    )
  }
}

// PATCH - обновить данные аниме
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const response = new NextResponse()
  const supabase = await createClientForRouteHandler(response)
  const user = await getAuthenticatedUser(supabase)

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: response.headers })
  }

  const userRole = await getUserRole(supabase, user.id)
  if (!isManagerOrHigher(userRole)) {
    return NextResponse.json({ error: "Forbidden: Admin or manager access required" }, { status: 403, headers: response.headers })
  }

  const animeId = parseInt(params.id)
  if (isNaN(animeId)) {
    return NextResponse.json({ error: "Invalid anime ID" }, { status: 400, headers: response.headers })
  }

  try {
    const body = await request.json()
    
    // Allowed fields for update
    const allowedFields = [
      "title",
      "title_orig",
      "year",
      "poster_url",
      "description",
      "status",
      "episodes_count",
      "episodes_total",
      "episodes_aired",
      "shikimori_rating",
      "shikimori_votes",
      "kinopoisk_rating",
      "kinopoisk_votes",
      "imdb_rating",
    ]

    const updateData: Record<string, any> = {}
    
    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400, headers: response.headers })
    }

    const { data: updatedAnime, error } = await supabase
      .from("animes")
      .update(updateData)
      .eq("id", animeId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(
      { success: true, anime: updatedAnime },
      { headers: response.headers }
    )
  } catch (error) {
    console.error("Error updating anime:", error)
    return NextResponse.json(
      { error: "Failed to update anime" },
      { status: 500, headers: response.headers }
    )
  }
}





