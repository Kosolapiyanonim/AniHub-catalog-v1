import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Проверяем, что ID выглядит как shikimori_id (число или строка с числом)
    if (!id || id === "popular" || id === "search" || id === "database") {
      return NextResponse.json({ error: "Invalid anime ID" }, { status: 400 })
    }

    console.log("🎬 Fetching anime data for shikimori_id:", id)

    // Ищем по shikimori_id в нашем VIEW
    const { data, error } = await supabase
      .from("animes_with_relations")
      .select("*")
      .eq("shikimori_id", id)
      .limit(1)
      .maybeSingle() // Используем maybeSingle вместо single

    if (error) {
      console.error(`❌ Database error for shikimori_id ${id}:`, error)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    if (!data) {
      console.log(`❌ Anime with shikimori_id ${id} not found`)
      return NextResponse.json({ error: "Anime not found" }, { status: 404 })
    }

    console.log("✅ Anime found:", data.title)
    return NextResponse.json(data)
  } catch (error) {
    console.error("❌ Error in anime API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
