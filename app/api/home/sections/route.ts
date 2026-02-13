import { NextResponse } from "next/server"
import { getHomeSecondarySections } from "@/lib/data-fetchers"

export async function GET() {
  const sections = await getHomeSecondarySections()
  return NextResponse.json(sections)
}
