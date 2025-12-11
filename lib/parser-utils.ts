import type { SupabaseClient } from "@supabase/supabase-js"
import type { KodikAnimeData, AnimeRecord } from "@/lib/types"

/**
 * Transforms Kodik API data into AnimeRecord format for database insertion
 */
export function transformToAnimeRecord(anime: KodikAnimeData): Partial<AnimeRecord> {
  const material = anime.material_data || {}

  return {
    shikimori_id: anime.shikimori_id,
    kinopoisk_id: anime.kinopoisk_id,
    title: material.anime_title || anime.title,
    title_orig: anime.title_orig,
    year: anime.year,
    poster_url: material.anime_poster_url || material.poster_url,
    player_link: anime.link,
    description: material.anime_description || material.description || "Описание отсутствует.",
    type: anime.type,
    status: material.anime_status,
    episodes_count: anime.episodes_count || material.episodes_total || 0,
    rating_mpaa: material.rating_mpaa,
    kinopoisk_rating: material.kinopoisk_rating,
    imdb_rating: material.imdb_rating,
    shikimori_rating: material.shikimori_rating,
    kinopoisk_votes: material.kinopoisk_votes,
    shikimori_votes: material.shikimori_votes,
    screenshots: { screenshots: anime.screenshots || [] },
    updated_at_kodik: anime.updated_at,
  }
}

/**
 * Processes a single relation type (genre, studio, or country)
 */
async function processRelation(
  supabaseClient: SupabaseClient,
  anime_id: number,
  items: string[] | undefined,
  relation_type: "genre" | "studio" | "country",
) {
  if (!items || items.length === 0) return

  const tableName = relation_type === "country" ? "countries" : `${relation_type}s`
  const idFieldName = `${relation_type}_id`
  const relationTableName = `anime_${tableName}`

  for (const name of items) {
    if (!name?.trim()) continue

    try {
      // Upsert the relation item (genre, studio, or country)
      const { data: relData, error: relError } = await supabaseClient
        .from(tableName)
        .upsert({ name: name.trim() }, { onConflict: "name" })
        .select("id")
        .single()

      if (relError) {
        console.error(`Error upserting ${relation_type} "${name}":`, relError)
        continue
      }

      if (relData) {
        // Create the anime-relation link
        const { error: linkError } = await supabaseClient
          .from(relationTableName)
          .upsert({ anime_id, [idFieldName]: relData.id }, { onConflict: `anime_id,${idFieldName}` })

        if (linkError) {
          console.error(`Error linking ${relation_type} "${name}" to anime ${anime_id}:`, linkError)
        }
      }
    } catch (error) {
      console.error(`Error processing ${relation_type} "${name}":`, error)
    }
  }
}

/**
 * Processes all relations (genres, studios, countries) for a single anime
 */
export async function processAllRelationsForAnime(
  supabaseClient: SupabaseClient,
  anime: KodikAnimeData,
  animeId: number,
) {
  const material = anime.material_data || {}

  await Promise.all([
    processRelation(supabaseClient, animeId, material.anime_genres, "genre"),
    processRelation(supabaseClient, animeId, material.anime_studios, "studio"),
    processRelation(supabaseClient, animeId, material.countries, "country"),
  ])
}

// HTML parsing utilities (preserved from original file)

export async function parseKodikPage(url: string) {
  try {
    // Simply return the URL as player link - Kodik handles embedding
    return url
  } catch (error) {
    console.error("Error parsing Kodik page:", error)
    return null
  }
}

export async function parseLatestUpdates(url: string) {
  // This function is deprecated - use Kodik API instead
  console.warn("parseLatestUpdates is deprecated, use Kodik API")
  return []
}
