// /app/api/subscriptions/route.ts
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { anime_id, subscribed } = await request.json();
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user_id = session.user.id;

  if (subscribed) {
    // Подписаться
    const { error } = await supabase.from('user_subscriptions').upsert({ user_id, anime_id });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ message: "Subscribed" });
  } else {
    // Отписаться
    const { error } = await supabase.from('user_subscriptions').delete().match({ user_id, anime_id });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ message: "Unsubscribed" });
  }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const anime_id = searchParams.get("anime_id");
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        return NextResponse.json({ subscribed: false });
    }

    const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('anime_id', anime_id)
        .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    
    return NextResponse.json({ subscribed: !!data });
}
