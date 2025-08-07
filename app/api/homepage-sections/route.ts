import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: sections, error } = await supabase
    .from('homepage_sections')
    .select(`
      id,
      title,
      type,
      animes:homepage_section_animes(anime_id)
    `)
    .order('order', { ascending: true });

  if (error) {
    console.error('Error fetching homepage sections:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const sectionsWithAnime = [];

  for (const section of sections) {
    const animeIds = section.animes.map((a: { anime_id: string }) => a.anime_id);
    if (animeIds.length > 0) {
      const { data: animes, error: animeError } = await supabase
        .from('animes')
        .select('*')
        .in('id', animeIds)
        .order('shikimori_rating', { ascending: false }); // Example ordering

      if (animeError) {
        console.error(`Error fetching anime for section ${section.title}:`, animeError.message);
        continue;
      }
      sectionsWithAnime.push({
        id: section.id,
        title: section.title,
        type: section.type,
        animes: animes,
      });
    } else {
      sectionsWithAnime.push({
        id: section.id,
        title: section.title,
        type: section.type,
        animes: [],
      });
    }
  }

  return NextResponse.json(sectionsWithAnime);
}
