import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")
  const animeId = searchParams.get("animeId")

  const supabase = createClient()

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 })
  }

  try {
    if (animeId) {
      // Get status for a specific anime for a user
      const { data, error } = await supabase
        .from("user_anime_lists")
        .select("status")
        .eq("user_id", userId)
        .eq("anime_id", animeId)
        .single()

      if (error && error.code !== "PGRST116") {
        // PGRST116 means "no rows found", which is fine
        console.error("Error fetching anime list status:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ status: data?.status || null })
    } else {
      // Get all lists for a user
      const { data, error } = await supabase
        .from("user_anime_lists")
        .select("status, anime_id, anime(*)") // Fetch related anime data
        .eq("user_id", userId)

      if (error) {
        console.error("Error fetching user lists:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      // Group anime by status
      const lists: { [key: string]: any[] } = {
        watching: [],
        planned: [],
        completed: [],
        dropped: [],
        on_hold: [],
      }

      data.forEach((item) => {
        if (item.status && lists[item.status]) {
          lists[item.status].push(item.anime)
        }
      })

      return NextResponse.json(lists)
    }
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const { userId, animeId, status } = await request.json()
  const supabase = createClient()

  if (!userId || !animeId || !status) {
    return NextResponse.json({ error: "User ID, Anime ID, and Status are required" }, { status: 400 })
  }

  try {
    const { data, error } = await supabase
      .from("user_anime_lists")
      .upsert({ user_id: userId, anime_id: animeId, status: status }, { onConflict: "user_id,anime_id" })
      .select()
      .single()

    if (error) {
      console.error("Error adding/updating anime to list:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")
  const animeId = searchParams.get("animeId")
  const supabase = createClient()

  if (!userId || !animeId) {
    return NextResponse.json({ error: "User ID and Anime ID are required" }, { status: 400 })
  }

  try {
    const { error } = await supabase.from("user_anime_lists").delete().eq("user_id", userId).eq("anime_id", animeId)

    if (error) {
      console.error("Error deleting anime from list:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Successfully removed" }, { status: 200 })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
