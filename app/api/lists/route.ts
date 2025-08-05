// /app/api/lists/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const supabase = createClient()
  const { animeId, status } = await request.json()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Check if an entry already exists for this user and anime
    const { data: existingEntry, error: fetchError } = await supabase
      .from("user_anime_lists")
      .select("*")
      .eq("user_id", user.id)
      .eq("anime_id", animeId)
      .single()

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 means no rows found
      console.error("Error checking existing entry:", fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    let result
    if (existingEntry) {
      if (status === null) {
        // If status is null, delete the entry
        const { data, error } = await supabase
          .from("user_anime_lists")
          .delete()
          .eq("user_id", user.id)
          .eq("anime_id", animeId)
        result = data
        if (error) throw error
        return NextResponse.json({ message: "Anime removed from list", status: null })
      } else {
        // Update existing entry
        const { data, error } = await supabase
          .from("user_anime_lists")
          .update({ status, updated_at: new Date().toISOString() })
          .eq("user_id", user.id)
          .eq("anime_id", animeId)
          .select()
          .single()
        result = data
        if (error) throw error
        return NextResponse.json({ message: "Anime list status updated", status: result.status })
      }
    } else {
      if (status === null) {
        // If no existing entry and status is null, do nothing
        return NextResponse.json({ message: "No entry to remove", status: null })
      }
      // Insert new entry
      const { data, error } = await supabase
        .from("user_anime_lists")
        .insert({ user_id: user.id, anime_id: animeId, status })
        .select()
        .single()
      result = data
      if (error) throw error
      return NextResponse.json({ message: "Anime added to list", status: result.status })
    }
  } catch (error: any) {
    console.error("Error updating anime list:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
