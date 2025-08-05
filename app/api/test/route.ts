import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.from("anime").select("*").limit(1)

    if (error) {
      console.error("Supabase test error:", error)
      return NextResponse.json({ status: "error", message: error.message }, { status: 500 })
    }

    return NextResponse.json({
      status: "ok",
      message: "Supabase connection successful",
      data: data,
    })
  } catch (error) {
    console.error("API test error:", error)
    return NextResponse.json({ status: "error", message: "An unexpected error occurred" }, { status: 500 })
  }
}
