import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  const supabase = createClient()

  try {
    const { data: anime, error } = await supabase
      .from("anime")
      .select(
        `
        *,
        anime_genres(genres(name)),
        anime_studios(studios(name)),
        related_anime:related_anime_anime_id_fkey(
          anime_by_related_id:related_id(
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
            rating_mpaa
          )
        ),
        similar_anime:similar_anime_anime_id_fkey(
          anime_by_similar_id:similar_id(
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
            rating_mpaa
          )
        ),
        user_anime_lists(status)
      `,
      )
      .eq("shikimori_id", id)
      .single()

    if (error) {
      console.error("Error fetching anime:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!anime) {
      return NextResponse.json({ error: "Anime not found" }, { status: 404 })
    }

    // Flatten the user_anime_lists to get the status directly
    const user_list_status = anime.user_anime_lists?.[0]?.status || null
    const formattedAnime = { ...anime, user_list_status }
    delete formattedAnime.user_anime_lists

    return NextResponse.json(formattedAnime)
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
