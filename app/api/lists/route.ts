import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const listName = searchParams.get('listName') // e.g., 'watching', 'planned', 'completed'

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }

  const supabase = createRouteHandlerClient({ cookies })

  try {
    let query = supabase
      .from('user_anime_lists')
      .select('*')
      .eq('user_id', userId)

    if (listName) {
      query = query.eq('name', listName)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching user lists:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const { userId, animeId, listName } = await request.json()

  if (!userId || !animeId || !listName) {
    return NextResponse.json({ error: 'Missing required fields: userId, animeId, listName' }, { status: 400 })
  }

  const supabase = createRouteHandlerClient({ cookies })

  try {
    // Check if the list already exists for the user and name
    const { data: existingList, error: fetchError } = await supabase
      .from('user_anime_lists')
      .select('id, animes')
      .eq('user_id', userId)
      .eq('name', listName)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error fetching existing list:', fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    let updatedAnimes: string[] = []
    if (existingList) {
      // List exists, update it
      const currentAnimes = existingList.animes || []
      if (currentAnimes.includes(animeId)) {
        return NextResponse.json({ message: 'Anime already in this list' }, { status: 200 })
      }
      updatedAnimes = [...currentAnimes, animeId]
      const { error: updateError } = await supabase
        .from('user_anime_lists')
        .update({ animes: updatedAnimes, updated_at: new Date().toISOString() })
        .eq('id', existingList.id)

      if (updateError) {
        console.error('Error updating list:', updateError)
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }
      return NextResponse.json({ message: 'Anime added to list successfully', list: { ...existingList, animes: updatedAnimes } })
    } else {
      // List does not exist, create a new one
      updatedAnimes = [animeId]
      const { data, error: insertError } = await supabase
        .from('user_anime_lists')
        .insert({ user_id: userId, name: listName, animes: updatedAnimes })
        .select()
        .single()

      if (insertError) {
        console.error('Error creating new list:', insertError)
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }
      return NextResponse.json({ message: 'New list created and anime added successfully', list: data })
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { userId, animeId, listName } = await request.json()

  if (!userId || !animeId || !listName) {
    return NextResponse.json({ error: 'Missing required fields: userId, animeId, listName' }, { status: 400 })
  }

  const supabase = createRouteHandlerClient({ cookies })

  try {
    const { data: existingList, error: fetchError } = await supabase
      .from('user_anime_lists')
      .select('id, animes')
      .eq('user_id', userId)
      .eq('name', listName)
      .single()

    if (fetchError) {
      console.error('Error fetching existing list for deletion:', fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!existingList || !existingList.animes || !existingList.animes.includes(animeId)) {
      return NextResponse.json({ message: 'Anime not found in this list' }, { status: 200 })
    }

    const updatedAnimes = existingList.animes.filter((id: string) => id !== animeId)

    const { error: updateError } = await supabase
      .from('user_anime_lists')
      .update({ animes: updatedAnimes, updated_at: new Date().toISOString() })
      .eq('id', existingList.id)

    if (updateError) {
      console.error('Error removing anime from list:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Anime removed from list successfully', list: { ...existingList, animes: updatedAnimes } })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
