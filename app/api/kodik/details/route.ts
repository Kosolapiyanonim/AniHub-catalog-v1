import { NextResponse } from "next/server"
import { fetchFromKodik, mapKodikResultToAnimeDetails } from "@/lib/kodik-server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 })
  }

  try {
    const data = await fetchFromKodik("/list", {
      id,
      with_material_data: true,
      with_seasons: true,
      with_episodes: true,
    })

    if (!data.results || data.results.length === 0) {
      return NextResponse.json(null)
    }

    return NextResponse.json(mapKodikResultToAnimeDetails(data.results[0]))
  } catch (error) {
    console.error("Kodik details error:", error)
    return NextResponse.json(null)
  }
}
