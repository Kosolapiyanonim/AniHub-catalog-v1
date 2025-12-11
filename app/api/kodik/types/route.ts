import { NextResponse } from "next/server"
import { fetchFromKodik } from "@/lib/kodik-server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const data = await fetchFromKodik("/anime_types")
    return NextResponse.json((data.results || []).map((t: any) => t.title))
  } catch (error) {
    console.error("Kodik types error:", error)
    return NextResponse.json([])
  }
}
