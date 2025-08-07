// /app/api/parser/route.ts (или /app/api/parse-single-page/route.ts)

import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { KodikAnimeData } from "@/lib/types";
import { transformToAnimeRecord, processAllRelationsForAnime, parseAndSaveAnime } from "@/lib/parser-utils";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { page } = await request.json();

    if (typeof page !== 'number' || page < 1) {
        return NextResponse.json({ error: 'Invalid page number' }, { status: 400 });
    }

    try {
        const result = await parseAndSaveAnime(page);
        return NextResponse.json({ message: `Parsed ${result.parsedCount} anime from page ${page}.`, ...result });
    } catch (error) {
        console.error(`Error parsing page ${page}:`, error);
        return NextResponse.json({ error: `Failed to parse page ${page}` }, { status: 500 });
    }
}
