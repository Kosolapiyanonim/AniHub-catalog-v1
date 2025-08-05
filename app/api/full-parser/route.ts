import { NextResponse } from "next/server"
import { parseAndSaveAnime } from "@/lib/parser-utils"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = Number.parseInt(searchParams.get("page") || "1")
  const limit = Number.parseInt(searchParams.get("limit") || "10") // Number of pages to parse in one go

  const supabase = createClient()

  try {
    const { data: lastParsedPageData, error: fetchError } = await supabase
      .from("parser_state")
      .select("last_parsed_page")
      .single()

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 means "no rows found", which is fine for initial run
      console.error("Error fetching parser state:", fetchError)
      return NextResponse.json({ error: "Failed to fetch parser state" }, { status: 500 })
    }

    let startPage = lastParsedPageData?.last_parsed_page || 1
    if (page > 1) {
      startPage = page // If a specific page is requested, start from there
    }

    let parsedCount = 0
    let lastSuccessfulPage = startPage - 1

    for (let i = 0; i < limit; i++) {
      const currentPage = startPage + i
      console.log(`Parsing page ${currentPage}...`)
      const success = await parseAndSaveAnime(currentPage)
      if (success) {
        parsedCount++
        lastSuccessfulPage = currentPage
      } else {
        console.warn(`Failed to parse page ${currentPage}. Stopping.`)
        break
      }
    }

    // Update last_parsed_page in Supabase
    const { error: updateError } = await supabase
      .from("parser_state")
      .upsert({ id: 1, last_parsed_page: lastSuccessfulPage }, { onConflict: "id" })

    if (updateError) {
      console.error("Error updating parser state:", updateError)
      return NextResponse.json({ error: "Failed to update parser state" }, { status: 500 })
    }

    return NextResponse.json({
      message: `Successfully parsed ${parsedCount} pages starting from page ${startPage}. Last successful page: ${lastSuccessfulPage}`,
      parsedPages: parsedCount,
      lastSuccessfulPage: lastSuccessfulPage,
    })
  } catch (error) {
    console.error("Unexpected error during full parsing:", error)
    return NextResponse.json({ error: "An unexpected error occurred during full parsing" }, { status: 500 })
  }
}
