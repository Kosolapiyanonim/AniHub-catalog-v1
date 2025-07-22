import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query")
  const limit = Number.parseInt(searchParams.get("limit") || "10", 10)

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] }, { status: 200 })
  }

  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  try {
    const { data, error } = await supabase
      .from("animes")
      .select("id, shikimori_id, title, title_orig, poster_url, year, type")
      .or(`title.ilike.%${query}%,title_orig.ilike.%${query}%`)
      .limit(limit)

    if (error) {
      console.error("Search API error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ results: data || [] })
  } catch (error) {
    console.error("Unexpected search API error:", error)
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
