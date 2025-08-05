// /app/api/parse-latest/route.ts

import { NextResponse } from "next/server"
import { parseLatestAnime } from "@/lib/parser-utils"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const { count, offset, force } = await request.json()
    console.log(`Starting parsing latest anime: count=${count}, offset=${offset}, force=${force}`)

    const result = await parseLatestAnime(count, offset, force)
    console.log("Finished parsing latest anime.")

    return NextResponse.json({
      message: "Latest anime parsing initiated",
      parsedCount: result.parsedCount,
      skippedCount: result.skippedCount,
    })
  } catch (error: any) {
    console.error("Error during latest anime parsing:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
