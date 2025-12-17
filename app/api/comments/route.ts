import { NextResponse } from "next/server"
import { createClientForRouteHandler, getAuthenticatedUser } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

// GET /api/comments?animeId=123
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const animeId = searchParams.get("animeId")
  // GET doesn't need auth, but we still use route handler client for consistency
  const response = new NextResponse();
  if (!animeId) return NextResponse.json({ error: "animeId is required" }, { status: 400, headers: response.headers })
  
  const supabase = await createClientForRouteHandler(response);
  const { data, error } = await supabase
    .from("comments")
    .select(`
      id, 
      anime_id, 
      user_id, 
      content, 
      created_at,
      parent_id,
      deleted_at
    `)
    .eq("anime_id", animeId)
    .order("created_at", { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: response.headers })
  
  // Get unique user IDs
  const userIds = [...new Set((data ?? []).map(c => c.user_id))]
  
  // Fetch profiles for all users
  const profilesMap = new Map<string, { username: string | null; avatar_url: string | null }>()
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .in("id", userIds)
    
    if (profiles) {
      profiles.forEach(profile => {
        profilesMap.set(profile.id, {
          username: profile.username,
          avatar_url: profile.avatar_url
        })
      })
    }
  }
  
  // Enrich comments with profile data
  const comments = (data ?? []).map(comment => ({
    ...comment,
    profiles: profilesMap.get(comment.user_id) || null
  }))
  const topLevel = comments.filter(c => !c.parent_id)
  const repliesMap = new Map<number, typeof comments>()
  
  comments.forEach(comment => {
    if (comment.parent_id) {
      if (!repliesMap.has(comment.parent_id)) {
        repliesMap.set(comment.parent_id, [])
      }
      repliesMap.get(comment.parent_id)!.push(comment)
    }
  })
  
  // Attach replies to their parents
  type CommentWithReplies = typeof comments[0] & { replies: CommentWithReplies[] }
  const organizeComments = (parent: typeof comments[0]): CommentWithReplies => {
    const replies = repliesMap.get(parent.id) || []
    return {
      ...parent,
      replies: replies.map(organizeComments)
    }
  }
  
  const organized = topLevel.map(organizeComments)
  return NextResponse.json(organized)
}

// POST /api/comments
export async function POST(request: Request) {
  const response = new NextResponse();
  const supabase = await createClientForRouteHandler(response);
  // Use secure authentication (getUser + fallback to getSession for token refresh)
  const user = await getAuthenticatedUser(supabase);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: response.headers })

  const body = await request.json().catch(() => null)
  const { animeId, content, parentId } = body || {}
  if (!animeId || !content || typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json({ error: "animeId and non-empty content required" }, { status: 400 })
  }

  // Rate limiting: Check user's recent comments
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString()
  const { data: recentComments, error: rateLimitError } = await supabase
    .from("comments")
    .select("id, created_at")
    .eq("user_id", user.id)
    .gte("created_at", oneMinuteAgo)
    .order("created_at", { ascending: false })

  if (rateLimitError) {
    return NextResponse.json({ error: "Failed to check rate limit" }, { status: 500, headers: response.headers })
  }

  const commentsInLastMinute = recentComments?.length || 0
  const MAX_COMMENTS_PER_MINUTE = 5
  const COOLDOWN_SECONDS = 30

  if (commentsInLastMinute >= MAX_COMMENTS_PER_MINUTE) {
    // Check if user is in cooldown period
    const oldestRecentComment = recentComments?.[recentComments.length - 1]
    if (oldestRecentComment) {
      const oldestCommentTime = new Date(oldestRecentComment.created_at).getTime()
      const timeSinceOldest = Date.now() - oldestCommentTime
      const cooldownMs = COOLDOWN_SECONDS * 1000

      if (timeSinceOldest < cooldownMs) {
        const remainingSeconds = Math.ceil((cooldownMs - timeSinceOldest) / 1000)
        return NextResponse.json(
          { 
            error: `Слишком много комментариев. Подождите ${remainingSeconds} секунд перед следующим комментарием.`,
            retryAfter: remainingSeconds
          },
          { status: 429, headers: response.headers }
        )
      }
    }
  }

  // Validate parentId if provided
  if (parentId !== undefined && parentId !== null) {
    const { data: parentComment } = await supabase
      .from("comments")
      .select("id, anime_id")
      .eq("id", parentId)
      .single()
    
    if (!parentComment || parentComment.anime_id !== animeId) {
      return NextResponse.json({ error: "Invalid parent comment" }, { status: 400, headers: response.headers })
    }
  }

  const { data: newComment, error } = await supabase
    .from("comments")
    .insert({ 
      anime_id: animeId, 
      user_id: user.id, 
      content: content.trim(),
      parent_id: parentId || null
    })
    .select(`
      id, 
      anime_id, 
      user_id, 
      content, 
      created_at,
      parent_id,
      deleted_at
    `)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: response.headers })
  
  // Fetch profile for the user
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, avatar_url")
    .eq("id", user.id)
    .single()
  
  const enrichedComment = {
    ...newComment,
    profiles: profile ? {
      username: profile.username,
      avatar_url: profile.avatar_url
    } : null
  }
  
  return NextResponse.json(enrichedComment, { status: 201, headers: response.headers })
}

// DELETE /api/comments?id=123
export async function DELETE(request: Request) {
  const response = new NextResponse();
  const supabase = await createClientForRouteHandler(response);
  // Use secure authentication (getUser + fallback to getSession for token refresh)
  const user = await getAuthenticatedUser(supabase);
  
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: response.headers })

  const { searchParams } = new URL(request.url)
  const commentId = searchParams.get("id")
  
  if (!commentId) {
    return NextResponse.json({ error: "Comment ID is required" }, { status: 400 })
  }

  // First, verify that the comment exists and belongs to the user
  const { data: comment, error: fetchError } = await supabase
    .from("comments")
    .select("id, user_id, deleted_at")
    .eq("id", commentId)
    .single()

  if (fetchError || !comment) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404, headers: response.headers })
  }

  if (comment.user_id !== user.id) {
    return NextResponse.json({ error: "You can only delete your own comments" }, { status: 403, headers: response.headers })
  }

  // Check if comment is already deleted
  if (comment.deleted_at) {
    return NextResponse.json({ error: "Comment already deleted" }, { status: 400, headers: response.headers })
  }

  // Check if this comment has any replies (child comments)
  const { data: replies, error: repliesError } = await supabase
    .from("comments")
    .select("id")
    .eq("parent_id", commentId)
    .is("deleted_at", null)
    .limit(1)

  if (repliesError) {
    return NextResponse.json({ error: repliesError.message }, { status: 500, headers: response.headers })
  }

  // If comment has replies, do soft delete (set deleted_at)
  // Otherwise, physically delete the comment
  if (replies && replies.length > 0) {
    // Soft delete: set deleted_at timestamp
    const { error: updateError } = await supabase
      .from("comments")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", commentId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500, headers: response.headers })
    }

    return NextResponse.json({ success: true, message: "Comment deleted (soft delete)" }, { status: 200, headers: response.headers })
  } else {
    // Physical delete: no replies, safe to delete
    const { error: deleteError } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500, headers: response.headers })
    }

    return NextResponse.json({ success: true, message: "Comment deleted" }, { status: 200, headers: response.headers })
  }
}
