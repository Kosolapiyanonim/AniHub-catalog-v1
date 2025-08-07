import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { CatalogAnime, CatalogResponse } from '@/lib/types'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '24')
  const search = searchParams.get('search') || ''
  const genres = searchParams.get('genres')?.split(',') || []
  const years = searchParams.get('years')?.split(',').map(Number).filter(Boolean) || []
  const statuses = searchParams.get('statuses')?.split(',') || []
  const types = searchParams.get('types')?.split(',') || []
  const studios = searchParams.get('studios')?.split(',') || []
  const sort = searchParams.get('sort') || 'shikimori_rating.desc' // Default sort

  const supabase = createRouteHandlerClient({ cookies })

  const offset = (page - 1) * limit

  try {
    let query = supabase
      .from('animes_with_relations')
      .select('*', { count: 'exact' })

    if (search) {
      query = query.ilike('title', `%${search}%`)
    }

    if (genres.length > 0) {
      query = query.contains('genres', genres)
    }

    if (years.length > 0) {
      query = query.in('year', years)
    }

    if (statuses.length > 0) {
      query = query.in('status', statuses)
    }

    if (types.length > 0) {
      query = query.in('type', types)
    }

    if (studios.length > 0) {
      query = query.contains('studios', studios)
    }

    const [sortBy, sortOrder] = sort.split('.')
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching catalog:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const hasMore = (count || 0) > page * limit

    const response: CatalogResponse = {
      results: data as CatalogAnime[],
      total: count || 0,
      hasMore,
      page,
      limit,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
