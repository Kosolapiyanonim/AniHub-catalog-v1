import { NextResponse } from "next/server"
import { fetchFromKodik } from "@/lib/kodik-server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const data = await fetchFromKodik("/years")
    const years = (data.results || []).map((y: any) => y.year).sort((a: number, b: number) => b - a)
    return NextResponse.json(years)
  } catch (error) {
    console.error("Kodik years error:", error)
    return NextResponse.json([])
  }
}
