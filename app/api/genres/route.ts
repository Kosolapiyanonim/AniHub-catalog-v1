import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.from("genres").select("name")

    if (error) {
      console.error("Error fetching genres:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const genres = data.map((g) => g.name)
    return NextResponse.json(genres)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
