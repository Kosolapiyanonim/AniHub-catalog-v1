import { NextResponse } from "next/server"
import { searchAnime } from "@/lib/meilisearch-client"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query") || ""
  const limit = Number.parseInt(searchParams.get("limit") || "10")

  if (!query) {
    return NextResponse.json([])
  }

  try {
    const results = await searchAnime(query, limit)
    return NextResponse.json(results)
  } catch (error) {
    console.error("Error during search:", error)
    return NextResponse.json({ error: "An unexpected error occurred during search" }, { status: 500 })
  }
}
