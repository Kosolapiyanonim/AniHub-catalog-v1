// /app/api/parse-latest/route.ts

import { NextResponse } from "next/server";
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { parseAndSaveAnime } from '@/lib/parser-utils'

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const result = await parseAndSaveAnime(1) // Parse only the first page for latest
        return NextResponse.json({ message: `Parsed ${result.parsedCount} latest anime.`, ...result })
    } catch (error) {
        console.error('Error parsing latest anime:', error)
        return NextResponse.json({ error: 'Failed to parse latest anime' }, { status: 500 })
    }
}
