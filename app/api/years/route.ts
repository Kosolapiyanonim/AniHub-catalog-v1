import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.from("years").select("year")

    if (error) {
      console.error("Error fetching years:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const years = data.map((y) => y.year)
    return NextResponse.json(years)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
