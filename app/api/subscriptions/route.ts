import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const animeId = searchParams.get('animeId')

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }

  const supabase = createRouteHandlerClient({ cookies })

  try {
    let query = supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)

    if (animeId) {
      query = query.eq('anime_id', animeId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching subscriptions:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const { userId, animeId } = await request.json()

  if (!userId || !animeId) {
    return NextResponse.json({ error: 'Missing required fields: userId, animeId' }, { status: 400 })
  }

  const supabase = createRouteHandlerClient({ cookies })

  try {
    // Check if already subscribed
    const { data: existingSubscription, error: fetchError } = await supabase
      .from('user_subscriptions')
      .select('id')
      .eq('user_id', userId)
      .eq('anime_id', animeId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error checking existing subscription:', fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (existingSubscription) {
      return NextResponse.json({ message: 'Already subscribed to this anime' }, { status: 200 })
    }

    const { data, error: insertError } = await supabase
      .from('user_subscriptions')
      .insert({ user_id: userId, anime_id: animeId })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating subscription:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Subscribed successfully', subscription: data })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { userId, animeId } = await request.json()

  if (!userId || !animeId) {
    return NextResponse.json({ error: 'Missing required fields: userId, animeId' }, { status: 400 })
  }

  const supabase = createRouteHandlerClient({ cookies })

  try {
    const { error } = await supabase
      .from('user_subscriptions')
      .delete()
      .eq('user_id', userId)
      .eq('anime_id', animeId)

    if (error) {
      console.error('Error deleting subscription:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Unsubscribed successfully' })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
