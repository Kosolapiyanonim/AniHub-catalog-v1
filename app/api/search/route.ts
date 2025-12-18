// src/app/api/search/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
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
      return NextResponse.json({ data: [], total: 0 }, { status: 200 })
    }
    return NextResponse.json({ error: validation.error.format() }, { status: 400 })
  }

  const validatedQuery = validation.data.query.trim()
  
  // Используем публичный клиент, как в catalog API
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 })
  }
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  // Используем ILIKE поиск, как в catalog API (строка 101)
  // Ищем по title и title_orig одновременно
  // Формат: title.ilike.%query%,title_orig.ilike.%query%
  
  // Выполняем два запроса параллельно
  const [dataResponse, countResponse] = await Promise.all([
    // Запрос №1: получаем 8 записей с детальной информацией
    supabase
      .from('animes')
      .select('title, poster_url, year, shikimori_id, type, status, raw_data', { count: 'exact' })
      .or(`title.ilike.%${validatedQuery}%,title_orig.ilike.%${validatedQuery}%`)
      .not('shikimori_id', 'is', null)
      .not('poster_url', 'is', null)
      .limit(8),
    // Запрос №2: получаем только общее количество
    supabase
      .from('animes')
      .select('*', { count: 'exact', head: true })
      .or(`title.ilike.%${validatedQuery}%,title_orig.ilike.%${validatedQuery}%`)
      .not('shikimori_id', 'is', null)
      .not('poster_url', 'is', null),
  ])
  
  const { data, error: dataError } = dataResponse
  const { count, error: countError } = countResponse

  if (dataError || countError) {
    console.error('Supabase search error:', dataError || countError)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }

  // Возвращаем и данные, и общее количество
  return NextResponse.json({ data: data || [], total: count ?? 0 })
}
