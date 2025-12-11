import { NextResponse } from "next/server"
import { fetchFromKodik } from "@/lib/kodik-server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const data = await fetchFromKodik("/genres")
    return NextResponse.json((data.results || []).map((g: any) => g.title))
  } catch (error) {
    console.error("Kodik genres error:", error)
    return NextResponse.json([])
  }
}
