import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.from("studios").select("name")

    if (error) {
      console.error("Error fetching studios:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const studios = data.map((s) => s.name)
    return NextResponse.json(studios)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
