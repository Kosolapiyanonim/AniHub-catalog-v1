import { NextResponse } from "next/server"
import { revalidateHomepageCaches } from "@/lib/data-fetchers"

export async function POST(request: Request) {
  const token = request.headers.get("x-revalidate-token")
  const expectedToken = process.env.REVALIDATE_TOKEN

  if (!expectedToken || token !== expectedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await revalidateHomepageCaches()

  return NextResponse.json({ ok: true, revalidated: ["/", "homepage", "homepage:hero", "homepage:sections"] })
}
