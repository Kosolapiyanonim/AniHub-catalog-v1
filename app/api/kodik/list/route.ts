import { NextResponse } from "next/server"
import { fetchFromKodik, mapKodikResultToAnime } from "@/lib/kodik-server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = searchParams.get("limit") || "20"
  const offset = searchParams.get("offset") || "0"

  // Collect all other params as filters
  const filters: Record<string, string> = {}
  searchParams.forEach((value, key) => {
    if (key !== "limit" && key !== "offset") {
      filters[key] = value
    }
  })

  try {
    const data = await fetchFromKodik("/list", {
      limit,
      offset,
      with_material_data: true,
      ...filters,
    })

    return NextResponse.json({
      animes: (data.results || []).map(mapKodikResultToAnime),
      total: data.total || 0,
    })
  } catch (error) {
    console.error("Kodik list error:", error)
    return NextResponse.json({ animes: [], total: 0 })
  }
}
