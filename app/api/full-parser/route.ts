import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { parseAndSaveAnime } from '@/lib/parser-utils'

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // This is a simplified example. In a real application,
  // you might want to run this as a background job or a serverless function
  // that can handle long-running tasks.
  // For demonstration, we'll just run it directly.

  try {
    let currentPage = 1
    let hasMore = true
    const totalParsed = 0

    // This loop will run indefinitely if not stopped.
    // In a real scenario, you'd have a mechanism to stop it,
    // or limit the number of pages/items.
    while (hasMore && currentPage <= 10) { // Limiting to 10 pages for safety
      console.log(`Starting full parse for page ${currentPage}...`)
      const result = await parseAndSaveAnime(currentPage)
      hasMore = result.hasMore
      // totalParsed += result.parsedCount
      currentPage++
      await new Promise(resolve => setTimeout(resolve, 1000)); // Delay to avoid rate limits
    }

    return NextResponse.json({ message: 'Full parsing process initiated. Check logs for progress.', totalParsed })
  } catch (error) {
    console.error('Error during full parsing:', error)
    return NextResponse.json({ error: 'Failed to initiate full parsing' }, { status: 500 })
  }
}
