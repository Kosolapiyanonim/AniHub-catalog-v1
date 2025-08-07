import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: studios, error } = await supabase
    .from('studios')
    .select('name')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching studios:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(studios.map(s => s.name));
}
