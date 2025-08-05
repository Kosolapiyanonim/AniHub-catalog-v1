import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")

  const supabase = createClient()

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 })
  }

  try {
    const { data, error } = await supabase.from("user_subscriptions").select("*").eq("user_id", userId).single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 means "no rows found", which is fine
      console.error("Error fetching subscription:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || null)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const { userId, plan, expires_at } = await request.json()
  const supabase = createClient()

  if (!userId || !plan || !expires_at) {
    return NextResponse.json({ error: "User ID, plan, and expires_at are required" }, { status: 400 })
  }

  try {
    const { data, error } = await supabase
      .from("user_subscriptions")
      .upsert({ user_id: userId, plan: plan, expires_at: expires_at }, { onConflict: "user_id" })
      .select()
      .single()

    if (error) {
      console.error("Error creating/updating subscription:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")
  const supabase = createClient()

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 })
  }

  try {
    const { error } = await supabase.from("user_subscriptions").delete().eq("user_id", userId)

    if (error) {
      console.error("Error deleting subscription:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Subscription cancelled" }, { status: 200 })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
