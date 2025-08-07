import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: lists, error } = await supabase
    .from('user_anime_lists')
    .select(`
      id,
      status,
      score,
      episodes_watched,
      anime:animes(
        id,
        shikimori_id,
        title,
        title_orig,
        poster_url,
        episodes_total,
        episodes_aired,
        status
      )
    `)
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching user lists:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(lists);
}

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { anime_id, status, score, episodes_watched } = await request.json();

  const { data, error } = await supabase
    .from('user_anime_lists')
    .upsert(
      {
        user_id: user.id,
        anime_id,
        status,
        score,
        episodes_watched,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,anime_id' } // Conflict on user_id and anime_id to update existing entry
    )
    .select()
    .single();

  if (error) {
    console.error('Error adding/updating list item:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { anime_id } = await request.json();

  const { error } = await supabase
    .from('user_anime_lists')
    .delete()
    .eq('user_id', user.id)
    .eq('anime_id', anime_id);

  if (error) {
    console.error('Error deleting list item:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Item deleted successfully' });
}
