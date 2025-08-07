import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '24');
  const genre = searchParams.get('genre');
  const status = searchParams.get('status');
  const year = searchParams.get('year');
  const type = searchParams.get('type');
  const studio = searchParams.get('studio');
  const sort = searchParams.get('sort') || 'shikimori_rating.desc'; // Default sort

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  let query = supabase
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
      year,
      shikimori_rating,
      genres:anime_genres(genres(name))
    `, { count: 'exact' });

  if (genre) {
    query = query.filter('anime_genres.genres.name', 'eq', genre);
  }
  if (status) {
    query = query.eq('status', status);
  }
  if (year) {
    query = query.eq('year', parseInt(year));
  }
  if (type) {
    query = query.eq('kind', type);
  }
  if (studio) {
    query = query.filter('anime_studios.studios.name', 'eq', studio);
  }

  // Apply sorting
  const [sortBy, sortOrder] = sort.split('.');
  if (sortBy && sortOrder) {
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
  }

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit - 1;

  const { data, error, count } = await query.range(startIndex, endIndex);

  if (error) {
    console.error('Error fetching catalog:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    animes: data,
    total: count,
    page,
    limit,
  });
}
