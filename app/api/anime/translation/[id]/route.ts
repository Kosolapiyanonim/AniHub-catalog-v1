import { NextResponse } from "next/server"

const KODIK_API_URL = "https://kodikapi.com"
const API_TOKEN = process.env.KODIK_API_TOKEN

export async function GET(request: Request, { params }: { params: { id: string } }) {
  console.log("🎬 Translation API called for ID:", params.id, "token exists:", !!API_TOKEN)

  if (!API_TOKEN) {
    console.error("❌ KODIK_API_TOKEN not found in environment variables")
    return NextResponse.json({ error: "API token not configured" }, { status: 500 })
  }

  const apiUrl = `${KODIK_API_URL}/search?token=${API_TOKEN}&id=${params.id}&with_material_data=true&with_episodes=true`
  console.log("🔗 Fetching anime by translation ID from:", apiUrl.replace(API_TOKEN, "***"))

  try {
    const response = await fetch(apiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; AnimeBot/1.0)",
      },
    })

    console.log("📡 Kodik translation API response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Kodik translation API error:", response.status, errorText)
      throw new Error(`Kodik API returned ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    console.log("✅ Kodik translation API success, found anime:", !!data.results?.[0])

    if (!data.results || data.results.length === 0) {
      return NextResponse.json({ error: "Anime not found" }, { status: 404 })
    }

    return NextResponse.json(data.results[0])
  } catch (error) {
    console.error("❌ Error fetching anime by translation:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch anime",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
