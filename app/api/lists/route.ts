// /app/api/lists/route.ts
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// GET-запрос для проверки статуса
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const anime_id = searchParams.get("anime_id");
  if (!anime_id) return NextResponse.json({ error: "anime_id is required" }, { status: 400 });

  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ status: null });

  const { data, error } = await supabase
    .from("user_lists")
    .select("status")
    .eq("user_id", session.user.id)
    .eq("anime_id", anime_id)
    .single();

  if (error && error.code !== 'PGRST116') return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ status: data?.status || null });
}

// POST-запрос для изменения статуса
export async function POST(request: Request) {
  const { anime_id, status } = await request.json();
  if (!anime_id || !status) return NextResponse.json({ error: "anime_id and status are required" }, { status: 400 });

  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user_id = session.user.id;

  if (status === 'remove') {
    const { error } = await supabase.from("user_lists").delete().match({ user_id, anime_id });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ message: "Successfully removed" });
  }

  const { error } = await supabase.from("user_lists").upsert({
    user_id,
    anime_id,
    status,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,anime_id' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: "List updated successfully" });
}
