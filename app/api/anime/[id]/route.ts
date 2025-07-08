// /app/api/anime/[id]/route.ts
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // 1️⃣ Validate ID
    if (!/^\d+$/.test(id)) {
      return NextResponse.json({ error: "Invalid anime ID format" }, { status: 400 })
    }

    // 2️⃣ Fetch main anime row
    const { data: anime, error: animeError } = await supabase.from("animes").select("*").eq("shikimori_id", id).single()

    if (animeError) {
      if (animeError.code === "PGRST116") {
        return NextResponse.json({ error: "Anime not found" }, { status: 404 })
      }
      throw animeError
    }

    // 3️⃣ Fetch pivot-table rows (no FK joins)
    const [
      { data: genreLinks, error: genreLinksErr },
      { data: studioLinks, error: studioLinksErr },
      { data: countryLinks, error: countryLinksErr },
      { data: translations, error: transErr },
    ] = await Promise.all([
      supabase.from("anime_genres").select("genre_id").eq("anime_id", anime.id),
      supabase.from("anime_studios").select("studio_id").eq("anime_id", anime.id),
      supabase.from("anime_countries").select("country_id").eq("anime_id", anime.id),
      supabase.from("translations").select("*").eq("anime_id", anime.id),
    ])

    if (genreLinksErr || studioLinksErr || countryLinksErr || transErr)
      throw genreLinksErr || studioLinksErr || countryLinksErr || transErr

    // Extract ids
    const genreIds = genreLinks?.map((g) => g.genre_id) ?? []
    const studioIds = studioLinks?.map((s) => s.studio_id) ?? []
    const countryIds = countryLinks?.map((c) => c.country_id) ?? []

    // 4️⃣ Fetch related entities in parallel
    const [
      { data: genres, error: genresErr },
      { data: studios, error: studiosErr },
      { data: countries, error: countriesErr },
    ] = await Promise.all([
      genreIds.length
        ? supabase.from("genres").select("name").in("id", genreIds)
        : Promise.resolve({ data: [], error: null }),
      studioIds.length
        ? supabase.from("studios").select("name").in("id", studioIds)
        : Promise.resolve({ data: [], error: null }),
      countryIds.length
        ? supabase.from("countries").select("name").in("id", countryIds)
        : Promise.resolve({ data: [], error: null }),
    ])

    if (genresErr || studiosErr || countriesErr) throw genresErr || studiosErr || countriesErr

    // 5️⃣ Compose response
    const responseData = {
      ...anime,
      translations: translations ?? [],
      genres: genres?.map((g) => g.name) ?? [],
      studios: studios?.map((s) => s.name) ?? [],
      countries: countries?.map((c) => c.name) ?? [],
    }

    return NextResponse.json(responseData)
  } catch (err) {
    console.error("❌ Error in /api/anime/[id]:", err)
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: "Internal server error", details: message }, { status: 500 })
  }
}
