// /app/api/lists/route.ts
import { NextResponse } from "next/server";
import { createClientForRouteHandler, getAuthenticatedUser } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const { anime_id, status } = await request.json();
  if (!anime_id || !status) {
    return NextResponse.json({ error: "anime_id and status are required" }, { status: 400 });
  }

  // Create response object first to capture cookie updates
  const response = new NextResponse();
  const supabase = await createClientForRouteHandler(response);
  // Use secure authentication (getUser + fallback to getSession for token refresh)
  const user = await getAuthenticatedUser(supabase);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: response.headers });
  }

  const user_id = user.id;

  if (status === 'remove') {
    const { error } = await supabase.from("user_lists").delete().match({ user_id, anime_id });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500, headers: response.headers });
    }
    return NextResponse.json({ message: "Successfully removed" }, { headers: response.headers });
  }

  const { error } = await supabase.from("user_lists").upsert({
    user_id,
    anime_id,
    status,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,anime_id' });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: response.headers });
  }
  return NextResponse.json({ message: "List updated successfully" }, { headers: response.headers });
}
