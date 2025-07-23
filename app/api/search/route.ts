// src/app/api/search/route.ts

import { NextRequest, NextResponse } from 'next/server'
// ИЗМЕНЕНИЕ: Используем правильный клиент для API-маршрутов
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const searchSchema = z.object({
  query: z.string().min(2, 'Query must be at least 2 characters long.'),
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('query')

  const validation = searchSchema.safeParse({ query })
  if (!validation.success) {
    if (query === '' || query === null) {
      return NextResponse.json({ data: [] }, { status: 200 })
    }
    return NextResponse.json({ error: validation.error.format() }, { status: 400 })
  }

  const validatedQuery = validation.data.query

  // ИЗМЕНЕНИЕ: Создаем клиент правильным способом
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  const ftsQuery = validatedQuery.trim().split(' ').join(' & ')

  const { data, error } = await supabase
    .from('animes')
    .select('title, poster_url, year, shikimori_id')
    .textSearch('ts_document', ftsQuery, {
      type: 'websearch',
      config: 'russian',
    })
    .limit(8)

  if (error) {
    console.error('Supabase search error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }

  // ИЗМЕНЕНИЕ: Оборачиваем ответ в { data }, как ожидает клиент
  return NextResponse.json({ data })
}
