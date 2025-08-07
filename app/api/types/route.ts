import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    // Fetch distinct types from the animes table
    const { data, error } = await supabase
      .from('animes')
      .select('type', { distinct: true })
      .not('type', 'is', null) // Exclude null types
      .order('type', { ascending: true })

    if (error) {
      console.error('Error fetching types:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const types = data.map(row => row.type)

    return NextResponse.json({ types })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
