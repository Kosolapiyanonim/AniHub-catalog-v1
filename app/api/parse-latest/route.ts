import { NextResponse } from "next/server"
import { parseAndSaveAnime } from "@/lib/parser-utils"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = Number.parseInt(searchParams.get("page") || "1")

  try {
    const success = await parseAndSaveAnime(page)

    if (success) {
      return NextResponse.json({
        message: `Successfully parsed and saved anime from page ${page}`,
      })
    } else {
      return NextResponse.json({ error: `Failed to parse or save anime from page ${page}` }, { status: 500 })
    }
  } catch (error) {
    console.error("Error during parsing:", error)
    return NextResponse.json({ error: "An unexpected error occurred during parsing" }, { status: 500 })
  }
}
