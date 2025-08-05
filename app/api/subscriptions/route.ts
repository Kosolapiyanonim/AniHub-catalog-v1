import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const supabase = createClient()
  const { email } = await request.json()

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  try {
    const { data, error } = await supabase.from("subscriptions").insert([{ email }]).select()

    if (error) {
      if (error.code === "23505") {
        // Unique violation
        return NextResponse.json({ error: "Email already subscribed" }, { status: 409 })
      }
      console.error("Error subscribing:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Successfully subscribed!", data })
  } catch (error: any) {
    console.error("Unexpected error during subscription:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
