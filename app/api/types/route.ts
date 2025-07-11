// /app/api/types/route.ts
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    // Эта функция запрашивает все уникальные значения из колонки 'type'
    const { data, error } = await supabase.rpc('get_distinct_types');
    if (error) throw error;
    // data вернется в виде [{type: 'tv_series'}, {type: 'movie'}, ...]
    return NextResponse.json(data.map(item => item.type));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
