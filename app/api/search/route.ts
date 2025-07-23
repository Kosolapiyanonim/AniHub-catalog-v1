// src/app/api/search/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server' // Используем серверный клиент
import { z } from 'zod'

// Схема для валидации входящего запроса
const searchSchema = z.object({
  query: z.string().min(2, 'Query must be at least 2 characters long.'),
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('query')

  // Валидация
  const validation = searchSchema.safeParse({ query })
  if (!validation.success) {
    if (query === '' || query === null) {
      return NextResponse.json({ data: [] }, { status: 200 })
    }
    return NextResponse.json({ error: validation.error.format() }, { status: 400 })
  }

  const validatedQuery = validation.data.query
  const supabase = createClient()

  // Преобразуем запрос для полнотекстового поиска ('one piece' -> 'one' & 'piece')
  const ftsQuery = validatedQuery.trim().split(' ').join(' & ')

  const { data, error } = await supabase
    .from('animes')
    // Используем эффективный полнотекстовый поиск по полю ts_document
    .select('title, poster_url, year, shikimori_id')
    .textSearch('ts_document', ftsQuery, {
      type: 'websearch',
      config: 'russian',
    })
    .limit(8) // Ограничиваем до 8 результатов для выпадающего меню

  if (error) {
    console.error('Supabase search error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 200 })
}
