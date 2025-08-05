import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = createClient()
  const { data: genres, error } = await supabase.from("genres").select("name").order("name", { ascending: true })

  if (error) {
    console.error("Error fetching genres:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(genres.map((g) => g.name))
}
