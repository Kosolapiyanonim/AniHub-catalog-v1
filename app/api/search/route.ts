import { NextResponse } from "next/server"
import { MeiliSearch } from "meilisearch"

const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST || "http://localhost:7700"
const MEILISEARCH_API_KEY = process.env.MEILISEARCH_API_KEY || "aSecretMasterKey"

const client = new MeiliSearch({
  host: MEILISEARCH_HOST,
  apiKey: MEILISEARCH_API_KEY,
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q") || ""
  const limit = Number.parseInt(searchParams.get("limit") || "10")

  if (!query) {
    return NextResponse.json({ results: [] })
  }

  try {
    const searchResults = await client.index("anime").search(query, {
      limit: limit,
      attributesToRetrieve: [
        "id",
        "shikimori_id",
        "title",
        "russian",
        "poster_url",
        "type",
        "year",
        "shikimori_rating",
      ],
    })

    return NextResponse.json({ results: searchResults.hits })
  } catch (error: any) {
    console.error("Error during MeiliSearch search:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
