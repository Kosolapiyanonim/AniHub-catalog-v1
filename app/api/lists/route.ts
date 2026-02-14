// /app/api/lists/route.ts
import { NextResponse } from "next/server";
import { createClientForRouteHandler, getAuthenticatedUser } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  const response = new NextResponse();
  const supabase = await createClientForRouteHandler(response);
  const user = await getAuthenticatedUser(supabase);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: response.headers });
  }

  const { data: listRows, error: listsError } = await supabase
    .from("user_lists")
    .select("anime_id, status, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (listsError) {
    return NextResponse.json({ error: listsError.message }, { status: 500, headers: response.headers });
  }

  const animeIds = [...new Set((listRows ?? []).map((row) => row.anime_id).filter(Boolean))];

  if (animeIds.length === 0) {
    return NextResponse.json({ items: [] }, { headers: response.headers });
  }

  const { data: animes, error: animeError } = await supabase
    .from("animes")
    .select("id, shikimori_id, title, poster_url, year, type")
    .in("id", animeIds);

  if (animeError) {
    return NextResponse.json({ error: animeError.message }, { status: 500, headers: response.headers });
  }


  const { data: animeRatings } = await supabase
    .from("user_anime_ratings")
    .select("anime_id, rating")
    .eq("user_id", user.id)
    .in("anime_id", animeIds);

  const ratingsMap = new Map((animeRatings ?? []).map((item) => [item.anime_id, item.rating]));

  const animeMap = new Map((animes ?? []).map((anime) => [anime.id, anime]));
  const items = (listRows ?? [])
    .map((row) => ({
      status: row.status,
      updated_at: row.updated_at,
      anime: animeMap.get(row.anime_id) ?? null,
      user_anime_rating: ratingsMap.get(row.anime_id) ?? null,
    }))
    .filter((row) => row.anime && row.anime.shikimori_id);

  return NextResponse.json({ items }, { headers: response.headers });
}

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
