import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = createClient()
  const { data: studios, error } = await supabase.from("studios").select("name").order("name", { ascending: true })

  if (error) {
    console.error("Error fetching studios:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(studios.map((s) => s.name))
}
