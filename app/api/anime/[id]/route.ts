import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  const supabase = createClient()

  try {
    const { data: anime, error } = await supabase.from("anime").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching anime:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!anime) {
      return NextResponse.json({ error: "Anime not found" }, { status: 404 })
    }

    return NextResponse.json(anime)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
