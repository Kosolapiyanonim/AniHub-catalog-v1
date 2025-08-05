import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = createClient()
  const { data: types, error } = await supabase.from("anime").select("type").distinct("type")

  if (error) {
    console.error("Error fetching types:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(types.map((t) => t.type).filter(Boolean))
}
