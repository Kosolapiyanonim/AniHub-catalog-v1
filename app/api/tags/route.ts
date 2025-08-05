import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = createClient()
  const { data: tags, error } = await supabase.from("tags").select("name").order("name", { ascending: true })

  if (error) {
    console.error("Error fetching tags:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(tags.map((t) => t.name))
}
