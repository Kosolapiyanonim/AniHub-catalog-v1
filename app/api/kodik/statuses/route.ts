import { NextResponse } from "next/server"
import { fetchFromKodik } from "@/lib/kodik-server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const data = await fetchFromKodik("/anime_statuses")
    return NextResponse.json((data.results || []).map((s: any) => s.title))
  } catch (error) {
    console.error("Kodik statuses error:", error)
    return NextResponse.json([])
  }
}
