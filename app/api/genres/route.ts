import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { GenresResponse } from '@/lib/types'

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    const { data, error, count } = await supabase
      .from('genres')
      .select('name', { count: 'exact' })
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching genres:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const genres = data.map(g => g.name)

    const response: GenresResponse = {
      genres,
      total: count || 0,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
