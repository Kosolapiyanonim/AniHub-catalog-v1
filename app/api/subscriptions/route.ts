// /app/api/subscriptions/route.ts
import { NextResponse } from "next/server";
import { createClientForRouteHandler, getAuthenticatedUser } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const { anime_id, subscribed } = await request.json();
  const response = new NextResponse();
  const supabase = await createClientForRouteHandler(response);

  // Use secure authentication (getUser + fallback to getSession for token refresh)
  const user = await getAuthenticatedUser(supabase);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: response.headers });

  const user_id = user.id;

  if (subscribed) {
    const { error } = await supabase.from('user_subscriptions').upsert({ user_id, anime_id }, { onConflict: 'user_id,anime_id' });
    if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: response.headers });
    return NextResponse.json({ message: "Subscribed" }, { headers: response.headers });
  } else {
    const { error } = await supabase.from('user_subscriptions').delete().match({ user_id, anime_id });
    if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: response.headers });
    return NextResponse.json({ message: "Unsubscribed" }, { headers: response.headers });
  }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const anime_id = searchParams.get("anime_id");
    const response = new NextResponse();
    const supabase = await createClientForRouteHandler(response);

    // Use secure authentication (getUser + fallback to getSession for token refresh)
    const user = await getAuthenticatedUser(supabase);
    if (!user) return NextResponse.json({ subscribed: false }, { headers: response.headers });

    const { data, error } = await supabase
        .from('user_subscriptions')
        .select('anime_id')
        .eq('user_id', user.id)
        .eq('anime_id', anime_id)
        .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: response.headers });
    return NextResponse.json({ subscribed: !!data }, { headers: response.headers });
}
