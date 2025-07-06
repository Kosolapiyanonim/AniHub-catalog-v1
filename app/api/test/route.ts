import { NextResponse } from "next/server"

export async function GET() {
  const hasKodikToken = !!process.env.KODIK_API_TOKEN

  // Test direct Kodik API call
  let kodikTestResult = null
  if (hasKodikToken) {
    try {
      const response = await fetch(
        `https://kodikapi.com/search?token=${process.env.KODIK_API_TOKEN}&id=serial-47661&with_material_data=true`,
        {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; AnimeBot/1.0)",
          },
        },
      )
      kodikTestResult = {
        status: response.status,
        ok: response.ok,
        hasResults: !!(await response.json()).results?.length,
      }
    } catch (error) {
      kodikTestResult = {
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  const availableEnvVars = Object.keys(process.env)
    .filter((key) => key === "NODE_ENV" || key.startsWith("VERCEL_"))
    .sort()

  return NextResponse.json({
    environment: process.env.NODE_ENV || "unknown",
    hasKodikToken,
    kodikTestResult,
    availableEnvVars,
    timestamp: new Date().toISOString(),
  })
}
