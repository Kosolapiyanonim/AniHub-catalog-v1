// src/app/api/search/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@/lib/supabase/route-handler"
import { z } from "zod"

export const dynamic = "force-dynamic"

const searchSchema = z.object({
  query: z.string().min(2, "Query must be at least 2 characters long."),
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get("query")

  const validation = searchSchema.safeParse({ query })
  if (!validation.success) {
    if (query === "" || query === null) {
      return NextResponse.json({ data: [], total: 0 }, { status: 200 })
    }
    return NextResponse.json({ error: validation.error.format() }, { status: 400 })
  }

  const validatedQuery = validation.data.query
  const supabase = createRouteHandlerClient()
  const ftsQuery = validatedQuery.trim().split(" ").join(" & ")

  // --- [ИЗМЕНЕНИЕ] Выполняем два запроса параллельно ---
  const [dataResponse, countResponse] = await Promise.all([
    // Запрос №1: получаем 8 записей с детальной информацией
    supabase
      .from("animes")
      .select("title, poster_url, year, shikimori_id, type, status, raw_data")
      .textSearch("ts_document", ftsQuery, { type: "websearch", config: "russian" })
      .limit(8),
    // Запрос №2: получаем только общее количество
    supabase
      .from("animes")
      .select("*", { count: "exact", head: true })
      .textSearch("ts_document", ftsQuery, { type: "websearch", config: "russian" }),
  ])

  const { data, error: dataError } = dataResponse
  const { count, error: countError } = countResponse

  if (dataError || countError) {
    console.error("Supabase search error:", dataError || countError)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }

  // --- [ИЗМЕНЕНИЕ] Возвращаем и данные, и общее количество ---
  return NextResponse.json({ data, total: count ?? 0 })
}
