import { NextResponse } from "next/server"
import { fetchFromKodik, mapKodikResultToAnime } from "@/lib/kodik-server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const [heroData, trendingData, popularData, latestData] = await Promise.all([
      fetchFromKodik("/list", {
        limit: 5,
        with_material_data: true,
        shikimori_rating: "7-10",
        anime_status: "ongoing",
      }),
      fetchFromKodik("/list", {
        limit: 10,
        with_material_data: true,
        shikimori_rating: "7-10",
        sort: "shikimori_rating",
      }),
      fetchFromKodik("/list", {
        limit: 10,
        with_material_data: true,
        sort: "views",
      }),
      fetchFromKodik("/list", {
        limit: 10,
        with_material_data: true,
        sort: "updated",
      }),
    ])

    return NextResponse.json({
      hero: (heroData.results || []).map(mapKodikResultToAnime),
      trending: (trendingData.results || []).map(mapKodikResultToAnime),
      popular: (popularData.results || []).map(mapKodikResultToAnime),
      latestUpdates: (latestData.results || []).map(mapKodikResultToAnime),
    })
  } catch (error) {
    console.error("Kodik homepage error:", error)
    return NextResponse.json({
      hero: [],
      trending: [],
      popular: [],
      latestUpdates: [],
    })
  }
}
