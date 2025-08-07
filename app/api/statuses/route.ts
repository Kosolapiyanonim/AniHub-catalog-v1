import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Fetch distinct statuses from the 'animes' table
  const { data, error } = await supabase
    .from('animes')
    .select('status', { distinct: true });

  if (error) {
    console.error('Error fetching distinct statuses:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Extract status names and filter out nulls/empty strings
  const statuses = data
    .map(row => row.status)
    .filter((status): status is string => typeof status === 'string' && status.trim() !== '')
    .sort(); // Sort alphabetically

  return NextResponse.json(statuses);
}
