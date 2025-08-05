import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = createClient()
  const { data: years, error } = await supabase
    .from("anime")
    .select("year")
    .distinct("year")
    .order("year", { ascending: false })

  if (error) {
    console.error("Error fetching years:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(years.map((y) => y.year).filter(Boolean))
}
