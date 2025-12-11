import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("📅 Fetching years from database...")

    // Получаем все уникальные годы из базы
    const { data, error } = await supabase
      .from("animes")
      .select("year")
      .not("year", "is", null)
      .order("year", { ascending: false })

    if (error) {
      console.error("❌ Error fetching years:", error)
      throw error
    }

    // Убираем дубликаты и сортируем
    const years = [...new Set(data?.map((item) => item.year).filter(Boolean))] as number[]
    years.sort((a, b) => b - a) // От новых к старым

    console.log(`✅ Found ${years.length} unique years`)

    return NextResponse.json({
      years,
      total: years.length,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Неизвестная ошибка"
    console.error("❌ Years API error:", message)
    return NextResponse.json({ status: "error", message, years: [] }, { status: 500 })
  }
}
