// scripts/sync-meilisearch.ts

import { MeiliSearch } from "meilisearch"
import { createClient } from "@supabase/supabase-js"

async function syncMeilisearch() {
  console.log("Starting MeiliSearch synchronization...")

  const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST
  const MEILISEARCH_API_KEY = process.env.MEILISEARCH_API_KEY
  const MEILISEARCH_INDEX = process.env.MEILISEARCH_INDEX || "animes"

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!MEILISEARCH_HOST || !MEILISEARCH_API_KEY) {
    console.error("MeiliSearch environment variables are not set.")
    return
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error("Supabase environment variables are not set.")
    return
  }

  try {
    const meilisearch = new MeiliSearch({
      host: MEILISEARCH_HOST,
      apiKey: MEILISEARCH_API_KEY,
    })

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    const { data: animes, error: supabaseError } = await supabase.from("animes").select(`
        id,
        shikimori_id,
        title,
        title_orig,
        year,
        poster_url,
        description,
        type,
        status,
        episodes_count,
        shikimori_rating,
        shikimori_votes,
        updated_at_kodik,
        genres:anime_genres(genres(name)),
        studios:anime_studios(studios(name)),
        kinds:anime_kinds(kinds(name))
      `)

    if (supabaseError) {
      console.error("Error fetching data from Supabase:", supabaseError.message)
      return
    }

    if (!animes || animes.length === 0) {
      console.log("No anime data found in Supabase to sync.")
      return
    }

    const documents = animes.map((anime) => ({
      id: anime.id,
      shikimori_id: anime.shikimori_id,
      title: anime.title,
      title_orig: anime.title_orig,
      year: anime.year,
      poster_url: anime.poster_url,
      description: anime.description,
      type: anime.type,
      status: anime.status,
      episodes_count: anime.episodes_count,
      shikimori_rating: anime.shikimori_rating,
      shikimori_votes: anime.shikimori_votes,
      updated_at_kodik: anime.updated_at_kodik,
      genres: anime.genres.map((g: any) => g.genres.name),
      studios: anime.studios.map((s: any) => s.studios.name),
      kinds: anime.kinds.map((k: any) => k.kinds.name), // Include anime_kind
    }))

    const index = meilisearch.index(MEILISEARCH_INDEX)

    // Set searchable attributes
    await index.updateSearchableAttributes([
      "title",
      "title_orig",
      "description",
      "genres",
      "studios",
      "kinds", // Add kinds to searchable attributes
    ])

    // Set filterable attributes
    await index.updateFilterableAttributes([
      "year",
      "genres",
      "studios",
      "status",
      "kinds", // Add kinds to filterable attributes
    ])

    // Set sortable attributes
    await index.updateSortableAttributes(["shikimori_rating", "shikimori_votes", "year", "updated_at_kodik"])

    const { taskUid } = await index.addDocuments(documents)
    console.log(`Documents added to MeiliSearch. Task UID: ${taskUid}`)

    const task = await meilisearch.getTask(taskUid)
    console.log("MeiliSearch task status:", task.status)

    if (task.status === "succeeded") {
      console.log(`Successfully synced ${documents.length} documents to MeiliSearch index "${MEILISEARCH_INDEX}".`)
    } else if (task.status === "failed") {
      console.error("MeiliSearch sync failed:", task.error)
    } else {
      console.log("MeiliSearch sync task is still processing...")
    }
  } catch (error: any) {
    console.error("Error during MeiliSearch synchronization:", error.message)
  }
}

syncMeilisearch()
