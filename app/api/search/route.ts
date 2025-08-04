// src/app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { animeIndex } from '@/lib/meilisearch-client'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const searchSchema = z.object({
  query: z.string().min(1, 'Query must not be empty'),
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('query') || ''

  const validation = searchSchema.safeParse({ query })
  if (!validation.success) {
    return NextResponse.json({ error: validation.error.format() }, { status: 400 })
  }

  try {
    const results = await animeIndex.search(validation.data.query, {
      limit: 12,
      attributesToRetrieve: ['id', 'title', 'poster_url', 'year', 'shikimori_id', 'type', 'status'],
      attributesToHighlight: ['title'],
    })

    return NextResponse.json({
      data: results.hits,
      total: results.estimatedTotalHits,
    })
  } catch (error) {
    console.error('Meilisearch error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}