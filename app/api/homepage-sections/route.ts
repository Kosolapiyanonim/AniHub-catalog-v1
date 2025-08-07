import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { CatalogAnime } from '@/lib/types'

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    // Fetch homepage sections configuration
    const { data: sectionsConfig, error: configError } = await supabase
      .from('homepage_sections')
      .select('*')
      .order('order', { ascending: true })

    if (configError) {
      console.error('Error fetching homepage sections config:', configError)
      return NextResponse.json({ error: configError.message }, { status: 500 })
    }

    const sectionsWithAnime = await Promise.all(sectionsConfig.map(async (section) => {
      // For each section, fetch the associated anime data
      const { data: animes, error: animeError } = await supabase
        .from('animes_with_relations')
        .select('*')
        .in('id', section.animes) // Assuming 'animes' in config is an array of anime IDs
        .order('shikimori_rating', { ascending: false }) // Example sorting

      if (animeError) {
        console.error(`Error fetching anime for section ${section.title}:`, animeError)
        // Decide how to handle errors for individual sections: skip, return empty, etc.
        return { ...section, animes: [] }
      }

      return { ...section, animes: animes as CatalogAnime[] }
    }))

    return NextResponse.json(sectionsWithAnime)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
