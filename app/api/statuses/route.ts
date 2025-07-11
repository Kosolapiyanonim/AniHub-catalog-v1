// /app/api/statuses/route.ts
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    // Эта функция запрашивает все уникальные значения из колонки 'status'
    const { data, error } = await supabase.rpc('get_distinct_statuses');
    if (error) throw error;

    return NextResponse.json(data.map(item => item.status));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
