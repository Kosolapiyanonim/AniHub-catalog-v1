import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = createClient()

  try {
    const { data: sections, error } = await supabase
      .from("homepage_sections")
      .select(
        `
        id,
        title,
        order,
        anime_ids
      `,
      )
      .order("order", { ascending: true })

    if (error) {
      console.error("Error fetching homepage sections:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const sectionsWithAnime = await Promise.all(
      sections.map(async (section) => {
        if (section.anime_ids && section.anime_ids.length > 0) {
          const { data: animeList, error: animeError } = await supabase
            .from("anime")
            .select(
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
            )
            .in("id", section.anime_ids)
            .order("shikimori_rating", { ascending: false }) // Example sorting

          if (animeError) {
            console.error(`Error fetching anime for section ${section.id}:`, animeError)
            return { ...section, anime: [] }
          }

          // Flatten the user_anime_lists to get the status directly for each anime
          const formattedAnime = animeList.map((item) => {
            const user_list_status = item.user_anime_lists?.[0]?.status || null
            const newItem = { ...item, user_list_status }
            delete newItem.user_anime_lists
            return newItem
          })

          return { ...section, anime: formattedAnime }
        }
        return { ...section, anime: [] }
      }),
    )

    return NextResponse.json(sectionsWithAnime)
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
