import { NextResponse } from "next/server"
import { createClientForRouteHandler, getAuthenticatedUser } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

// GET /api/profile?userId=xxx - Get profile (current user's if no userId, or specified user's)
export async function GET(request: Request) {
  const response = new NextResponse();
  const supabase = await createClientForRouteHandler(response);
  const { searchParams } = new URL(request.url)
  const requestedUserId = searchParams.get("userId")
  
  // Use secure authentication (getUser + fallback to getSession for token refresh)
  // Only needed if userId is not specified (getting current user's profile)
  const user = requestedUserId ? null : await getAuthenticatedUser(supabase);
  
  // If userId is specified, use it; otherwise use current user's id
  const targetUserId = requestedUserId || user?.id
  
  if (!targetUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: response.headers })
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, role, created_at, updated_at")
    .eq("id", targetUserId)
    .single()

  if (error) {
    // If profile doesn't exist and it's the current user, create it
    if (error.code === "PGRST116" && user && targetUserId === user.id) {
      const { data: newProfile, error: insertError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          username: `user_${user.id.slice(0, 8)}`,
        })
        .select("id, username, avatar_url, role, created_at, updated_at")
        .single()

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500, headers: response.headers })
      }
      return NextResponse.json(newProfile, { headers: response.headers })
    }
    return NextResponse.json({ error: error.message }, { status: 500, headers: response.headers })
  }

  return NextResponse.json(data, { headers: response.headers })
}

// PATCH /api/profile - Update current user's profile
export async function PATCH(request: Request) {
  const response = new NextResponse();
  const supabase = await createClientForRouteHandler(response);
  // Use secure authentication (getUser + fallback to getSession for token refresh)
  const user = await getAuthenticatedUser(supabase);
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: response.headers })
  }

  const body = await request.json().catch(() => null)
  const { username, avatar_url } = body || {}

  // Validate username if provided
  if (username !== undefined) {
    if (typeof username !== "string") {
      return NextResponse.json({ error: "Username must be a string" }, { status: 400, headers: response.headers })
    }
    
    const trimmedUsername = username.trim()
    if (trimmedUsername.length === 0) {
      return NextResponse.json({ error: "Username cannot be empty" }, { status: 400, headers: response.headers })
    }
    
    if (trimmedUsername.length < 3) {
      return NextResponse.json({ error: "Username must be at least 3 characters" }, { status: 400, headers: response.headers })
    }
    
    if (trimmedUsername.length > 30) {
      return NextResponse.json({ error: "Username must be at most 30 characters" }, { status: 400, headers: response.headers })
    }
    
    // Check if username is already taken by another user
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", trimmedUsername)
      .neq("id", user.id)
      .single()
    
    if (existingProfile) {
      return NextResponse.json({ error: "Username is already taken" }, { status: 400, headers: response.headers })
    }
  }

  const updateData: { username?: string; avatar_url?: string; updated_at?: string } = {
    updated_at: new Date().toISOString(),
  }
  
  if (username !== undefined) {
    updateData.username = username.trim()
  }
  
  if (avatar_url !== undefined) {
    updateData.avatar_url = avatar_url
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", user.id)
    .select("id, username, avatar_url, role, created_at, updated_at")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: response.headers })
  }

  return NextResponse.json(data, { headers: response.headers })
}
