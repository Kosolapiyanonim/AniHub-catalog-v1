import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

// Cache for images (1 hour)
const CACHE_MAX_AGE = 3600

/**
 * Proxy endpoint for images
 * GET /api/images/proxy?url=<encoded_url>
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get("url")

  if (!imageUrl) {
    return NextResponse.json({ error: "URL parameter is required" }, { status: 400 })
  }

  try {
    // Decode the URL
    const decodedUrl = decodeURIComponent(imageUrl)
    
    // Validate URL
    let url: URL
    try {
      url = new URL(decodedUrl)
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 })
    }

    // Security: Only allow HTTPS
    if (url.protocol !== "https:") {
      return NextResponse.json({ error: "Only HTTPS URLs are allowed" }, { status: 400 })
    }

    // Fetch the image
    const imageResponse = await fetch(decodedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Referer": url.origin,
      },
      // Add timeout
      signal: AbortSignal.timeout(10000), // 10 seconds
    })

    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image: ${imageResponse.statusText}` },
        { status: imageResponse.status }
      )
    }

    // Get content type
    const contentType = imageResponse.headers.get("content-type") || "image/jpeg"
    
    // Check if it's actually an image
    if (!contentType.startsWith("image/")) {
      return NextResponse.json({ error: "URL does not point to an image" }, { status: 400 })
    }

    // Get image data
    const imageBuffer = await imageResponse.arrayBuffer()

    // Return the image with appropriate headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": `public, max-age=${CACHE_MAX_AGE}, s-maxage=${CACHE_MAX_AGE}`,
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch (error) {
    console.error("Image proxy error:", error)
    
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json({ error: "Request timeout" }, { status: 504 })
    }

    return NextResponse.json(
      { error: "Failed to proxy image" },
      { status: 500 }
    )
  }
}

