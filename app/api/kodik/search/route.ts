import { NextResponse } from "next/server"
import { fetchFromKodik, mapKodikResultToAnime } from "@/lib/kodik-server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query")
  const limit = searchParams.get("limit") || "10"

  if (!query) {
    return NextResponse.json({ results: [] })
  }

  try {
    const data = await fetchFromKodik("/search", {
      title: query,
      limit,
      with_material_data: true,
    })

    return NextResponse.json({
      results: (data.results || []).map(mapKodikResultToAnime),
    })
  } catch (error) {
    console.error("Kodik search error:", error)
    return NextResponse.json({ results: [] })
  }
}
