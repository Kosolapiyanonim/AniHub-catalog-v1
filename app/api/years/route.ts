import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Проверяем, что переменные окружения настроены
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn("⚠️ Supabase environment variables not configured, returning empty years list")
      return NextResponse.json({ years: [], total: 0 })
    }

    console.log("📅 Fetching years from database...")

    // Получаем все уникальные годы из базы
    const { data, error } = await supabase
      .from("animes")
      .select("year")
      .not("year", "is", null)
      .order("year", { ascending: false })

    if (error) {
      console.error("❌ Error fetching years:", error)
      // Возвращаем пустой список вместо ошибки, чтобы не ломать build
      return NextResponse.json({ years: [], total: 0, error: error.message })
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
    const details = error instanceof Error && 'details' in error ? String(error.details) : ''
    console.error("❌ Years API error:", { message, details })
    
    // Возвращаем пустой список вместо ошибки, чтобы не ломать build
    return NextResponse.json({ 
      status: "error", 
      message, 
      years: [], 
      total: 0 
    })
  }
}
