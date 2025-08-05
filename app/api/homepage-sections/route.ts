import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = createClient()

  try {
    // Fetch 10 popular anime (e.g., by shikimori_rating)
    const { data: popularAnime, error: popularError } = await supabase
      .from("anime")
      .select("*")
      .order("shikimori_rating", { ascending: false })
      .limit(10)

    if (popularError) {
      console.error("Error fetching popular anime:", popularError)
      return NextResponse.json({ error: popularError.message }, { status: 500 })
    }

    // Fetch 10 recently updated anime (e.g., by updated_at)
    const { data: recentlyUpdatedAnime, error: updatedError } = await supabase
      .from("anime")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(10)

    if (updatedError) {
      console.error("Error fetching recently updated anime:", updatedError)
      return NextResponse.json({ error: updatedError.message }, { status: 500 })
    }

    // Fetch 10 new anime (e.g., by created_at)
    const { data: newAnime, error: newError } = await supabase
      .from("anime")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10)

    if (newError) {
      console.error("Error fetching new anime:", newError)
      return NextResponse.json({ error: newError.message }, { status: 500 })
    }

    // Fetch 10 random anime for the hero slider
    const { data: heroSliderAnime, error: heroError } = await supabase
      .from("anime")
      .select("*")
      .limit(5) // Limit to 5 for the slider
      .order("id", { ascending: true }) // Order by ID to get a consistent "random" set for demo

    if (heroError) {
      console.error("Error fetching hero slider anime:", heroError)
      return NextResponse.json({ error: heroError.message }, { status: 500 })
    }

    return NextResponse.json({
      heroSlider: heroSliderAnime,
      popular: popularAnime,
      recentlyUpdated: recentlyUpdatedAnime,
      new: newAnime,
    })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
