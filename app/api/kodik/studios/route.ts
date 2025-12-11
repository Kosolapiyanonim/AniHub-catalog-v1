import { NextResponse } from "next/server"
import { fetchFromKodik } from "@/lib/kodik-server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const data = await fetchFromKodik("/studios")
    return NextResponse.json((data.results || []).map((s: any) => s.title))
  } catch (error) {
    console.error("Kodik studios error:", error)
    return NextResponse.json([])
  }
}
