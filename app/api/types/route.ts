import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Fetch distinct 'kind' (type) from the 'animes' table
  const { data, error } = await supabase
    .from('animes')
    .select('kind', { distinct: true });

  if (error) {
    console.error('Error fetching distinct anime types:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Extract types and filter out nulls/empty strings
  const types = data
    .map(row => row.kind)
    .filter((kind): kind is string => typeof kind === 'string' && kind.trim() !== '')
    .sort(); // Sort alphabetically

  return NextResponse.json(types);
}
