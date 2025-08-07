import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json([]);
  }

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('animes')
    .select(`
      id,
      shikimori_id,
      title,
      title_orig,
      poster_url,
      episodes_total,
      episodes_aired,
      status,
      genres:anime_genres(genres(name)),
      year
    `)
    .or(`title.ilike.%${query}%,title_orig.ilike.%${query}%`)
    .limit(10);

  if (error) {
    console.error('Error during search:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
