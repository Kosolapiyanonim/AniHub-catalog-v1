import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    // Fetch distinct statuses from the animes table
    const { data, error } = await supabase
      .from('animes')
      .select('status', { distinct: true })
      .not('status', 'is', null) // Exclude null statuses
      .order('status', { ascending: true })

    if (error) {
      console.error('Error fetching statuses:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const statuses = data.map(row => row.status)

    return NextResponse.json({ statuses })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
