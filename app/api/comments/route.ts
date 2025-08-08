import { NextResponse } from "next/server"
import createClient from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

// GET /api/comments?animeId=123
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const animeId = searchParams.get("animeId")
  if (!animeId) return NextResponse.json({ error: "animeId is required" }, { status: 400 })

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("comments")
    .select("id, anime_id, user_id, content, created_at, profiles:profiles!comments_user_id_fkey(username, avatar_url)")
    .eq("anime_id", animeId)
    .order("created_at", { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

// POST /api/comments
export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json().catch(() => null)
  const { animeId, content } = body || {}
  if (!animeId || !content || typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json({ error: "animeId and non-empty content required" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({ anime_id: animeId, user_id: user.id, content: content.trim() })
    .select("id, anime_id, user_id, content, created_at")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}


