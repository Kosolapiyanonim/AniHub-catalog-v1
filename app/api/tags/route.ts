import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    // Fetch distinct tags from the animes_with_relations view
    // This assumes 'tags' is an array column in the view
    const { data, error } = await supabase
      .from('animes_with_relations')
      .select('tags')

    if (error) {
      console.error('Error fetching tags:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Extract all unique tags
    const allTags = new Set<string>()
    data.forEach(row => {
      if (Array.isArray(row.tags)) {
        row.tags.forEach((tag: string) => allTags.add(tag))
      }
    })

    const tags = Array.from(allTags).sort() // Sort alphabetically

    return NextResponse.json({ tags })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
