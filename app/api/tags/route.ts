import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.from("tags").select("name")

    if (error) {
      console.error("Error fetching tags:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const tags = data.map((t) => t.name)
    return NextResponse.json(tags)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
