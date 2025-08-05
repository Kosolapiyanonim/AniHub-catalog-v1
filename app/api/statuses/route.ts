import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = createClient()
  const { data: statuses, error } = await supabase.from("anime").select("status").distinct("status")

  if (error) {
    console.error("Error fetching statuses:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(statuses.map((s) => s.status).filter(Boolean))
}
