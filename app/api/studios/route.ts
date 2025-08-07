import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    const { data, error, count } = await supabase
      .from('studios')
      .select('name', { count: 'exact' })
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching studios:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const studios = data.map(s => s.name)

    return NextResponse.json({ studios, total: count || 0 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
