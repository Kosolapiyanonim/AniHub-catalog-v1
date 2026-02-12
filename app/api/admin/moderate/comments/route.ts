import { NextRequest, NextResponse } from "next/server"
import { createClientForRouteHandler, getAuthenticatedUser } from "@/lib/supabase/server"
import { getUserRole, isManagerOrHigher } from "@/lib/role-utils"

export const dynamic = "force-dynamic"

// GET - получить список комментариев для модерации
export async function GET(request: NextRequest) {
  const response = new NextResponse()
  const supabase = await createClientForRouteHandler(response)
  const user = await getAuthenticatedUser(supabase)

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: response.headers })
  }

  const userRole = await getUserRole(supabase, user.id)
  if (!isManagerOrHigher(userRole)) {
    return NextResponse.json({ error: "Forbidden: Admin or manager access required" }, { status: 403, headers: response.headers })
  }

  const { searchParams } = new URL(request.url)
  const filter = searchParams.get("filter") || "all" // all, deleted, recent
  const limit = parseInt(searchParams.get("limit") || "50")
  const offset = parseInt(searchParams.get("offset") || "0")

  try {
    let query = supabase
      .from("comments")
      .select(`
        id,
        anime_id,
        user_id,
        content,
        created_at,
        deleted_at,
        profiles:user_id (username, avatar_url),
        animes:anime_id (title, shikimori_id)
      `)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (filter === "deleted") {
      query = query.not("deleted_at", "is", null)
    } else if (filter === "recent") {
      const oneDayAgo = new Date()
      oneDayAgo.setDate(oneDayAgo.getDate() - 1)
      query = query.gte("created_at", oneDayAgo.toISOString())
    } else {
      query = query.is("deleted_at", null)
    }

    const { data: comments, error } = await query

    if (error) {
      throw error
    }

    // Get total count
    let countQuery = supabase.from("comments").select("*", { count: "exact", head: true })
    if (filter === "deleted") {
      countQuery = countQuery.not("deleted_at", "is", null)
    } else if (filter === "recent") {
      const oneDayAgo = new Date()
      oneDayAgo.setDate(oneDayAgo.getDate() - 1)
      countQuery = countQuery.gte("created_at", oneDayAgo.toISOString())
    } else {
      countQuery = countQuery.is("deleted_at", null)
    }
    const { count } = await countQuery

    return NextResponse.json(
      {
        comments: comments || [],
        total: count || 0,
        limit,
        offset,
      },
      { headers: response.headers }
    )
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500, headers: response.headers }
    )
  }
}

// DELETE - удалить комментарий (только для админов)
export async function DELETE(request: NextRequest) {
  const response = new NextResponse()
  const supabase = await createClientForRouteHandler(response)
  const user = await getAuthenticatedUser(supabase)

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: response.headers })
  }

  const userRole = await getUserRole(supabase, user.id)
  if (userRole !== "admin") {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403, headers: response.headers })
  }

  const { searchParams } = new URL(request.url)
  const commentId = searchParams.get("id")

  if (!commentId) {
    return NextResponse.json({ error: "Comment ID is required" }, { status: 400, headers: response.headers })
  }

  try {
    // Check if comment has replies
    const { data: replies } = await supabase
      .from("comments")
      .select("id")
      .eq("parent_id", commentId)
      .is("deleted_at", null)
      .limit(1)

    if (replies && replies.length > 0) {
      // Soft delete
      const { error } = await supabase
        .from("comments")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", commentId)

      if (error) throw error

      return NextResponse.json({ success: true, message: "Comment soft deleted" }, { headers: response.headers })
    } else {
      // Hard delete
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId)

      if (error) throw error

      return NextResponse.json({ success: true, message: "Comment deleted" }, { headers: response.headers })
    }
  } catch (error) {
    console.error("Error deleting comment:", error)
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500, headers: response.headers }
    )
  }
}





