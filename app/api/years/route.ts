import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Fetch distinct years from the 'animes' table
  const { data, error } = await supabase
    .from('animes')
    .select('year', { distinct: true });

  if (error) {
    console.error('Error fetching distinct years:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Extract years, filter out nulls, and sort in descending order
  const years = data
    .map(row => row.year)
    .filter((year): year is number => typeof year === 'number' && year !== null)
    .sort((a, b) => b - a); // Sort descending

  return NextResponse.json(years);
}
