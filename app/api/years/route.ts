import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { YearsResponse } from '@/lib/types'

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    // Fetch distinct years from the animes table
    const { data, error } = await supabase
      .from('animes')
      .select('year', { distinct: true })
      .not('year', 'is', null) // Exclude null years
      .order('year', { ascending: false }) // Order by year descending

    if (error) {
      console.error('Error fetching years:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const years = data.map(row => row.year) as number[]

    const response: YearsResponse = {
      years,
      total: years.length,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
