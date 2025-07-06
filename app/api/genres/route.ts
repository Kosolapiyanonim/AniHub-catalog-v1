import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("🎭 Fetching genres from database...")

    // Получаем все уникальные жанры из базы
    const { data, error } = await supabase.from("genres").select("name").order("name")

    if (error) {
      console.error("❌ Error fetching genres:", error)
      throw error
    }

    const genres = data?.map((item) => item.name) || []
    console.log(`✅ Found ${genres.length} genres`)

    return NextResponse.json({
      genres,
      total: genres.length,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Неизвестная ошибка"
    console.error("❌ Genres API error:", message)
    return NextResponse.json({ status: "error", message, genres: [] }, { status: 500 })
  }
}
