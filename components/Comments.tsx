"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSupabase } from "@/components/supabase-provider"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Reply, MessageSquare, ChevronDown, ChevronRight, Trash2 } from "lucide-react"
import { toast } from "sonner"

type CommentItem = {
  id: number
  anime_id: number
  user_id: string
  content: string
  created_at: string
  parent_id?: number | null
  deleted_at?: string | null
  replies?: CommentItem[]
  profiles?: { username?: string | null; avatar_url?: string | null } | null
}

export default function Comments({ animeId }: { animeId: number }) {
  const { supabase, session, refreshSession } = useSupabase()
  const [comments, setComments] = useState<CommentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [content, setContent] = useState("")
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyContent, setReplyContent] = useState<Record<number, string>>({})
  const [expandedReplies, setExpandedReplies] = useState<Set<number>>(new Set())
  const isAuthed = !!session?.user

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/comments?animeId=${animeId}`, { cache: "no-store" })
        if (!res.ok) throw new Error((await res.json()).error || "Ошибка загрузки комментариев")
        const raw = (await res.json()) as CommentItem[]
        // Enrich with profile info by fetching from /api/types/profiles if desired later.
        setComments(raw)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Неизвестная ошибка")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [animeId])

  const handleSubmit = async () => {
    if (!isAuthed) return
    const payload = { animeId, content: content.trim() }
    if (!payload.content) return
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: 'include',
    })
    
    if (res.ok) {
      // Refresh client session after successful API call to sync with server
      await refreshSession();
      setContent("")
      await refreshComments()
    } else {
      const errorData = await res.json().catch(() => ({ error: "Ошибка при отправке комментария" }))
      if (res.status === 401) {
        // Try to refresh session on 401
        await refreshSession();
        toast.error("Сессия истекла. Обновите страницу.")
      } else if (res.status === 429) {
        toast.error(errorData.error || "Слишком много комментариев. Подождите немного.")
      } else {
        toast.error(errorData.error || "Не удалось отправить комментарий")
      }
    }
  }

  const handleReply = async (parentId: number) => {
    if (!isAuthed) return
    const content = replyContent[parentId]?.trim()
    if (!content) return
    
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ animeId, content, parentId }),
      credentials: 'include',
    })
    if (res.ok) {
      // Refresh client session after successful API call
      await refreshSession();
      setReplyContent(prev => ({ ...prev, [parentId]: "" }))
      setReplyingTo(null)
      await refreshComments()
    } else if (res.status === 401) {
      // Try to refresh session on 401
      await refreshSession();
      toast.error("Сессия истекла. Обновите страницу.")
    }
  }

  const refreshComments = async () => {
    const refreshed = await fetch(`/api/comments?animeId=${animeId}`, { cache: "no-store" })
    if (refreshed.ok) setComments(await refreshed.json())
  }

  const handleDelete = async (commentId: number) => {
    if (!isAuthed) return
    
    if (!confirm("Вы уверены, что хотите удалить этот комментарий?")) {
      return
    }

    const res = await fetch(`/api/comments?id=${commentId}`, {
      method: "DELETE",
      credentials: 'include',
    })

    if (res.ok) {
      // Refresh client session after successful API call
      await refreshSession();
      toast.success("Комментарий удален")
      await refreshComments()
    } else {
      const errorData = await res.json().catch(() => ({ error: "Ошибка при удалении комментария" }))
      if (res.status === 401) {
        // Try to refresh session on 401
        await refreshSession();
        toast.error("Сессия истекла. Обновите страницу.")
      } else {
        toast.error(errorData.error || "Не удалось удалить комментарий")
      }
    }
  }

  const getUserDisplayName = (comment: CommentItem) => {
    return comment.profiles?.username || `user_${comment.user_id.slice(0, 8)}`
  }

  const getUserInitials = (comment: CommentItem) => {
    const name = comment.profiles?.username || comment.user_id
    return name?.charAt(0).toUpperCase() || "U"
  }

  const getAvatarUrl = (comment: CommentItem) => {
    return comment.profiles?.avatar_url || undefined
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Комментарии</h3>

      {isAuthed ? (
        <div className="space-y-2">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Оставьте комментарий"
          />
          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={!content.trim()}>
              Опубликовать
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-sm text-slate-400">Войдите, чтобы оставить комментарий.</div>
      )}

      {loading ? (
        <div className="text-slate-400 text-sm">Загрузка...</div>
      ) : error ? (
        <div className="text-red-400 text-sm">{error}</div>
      ) : comments.length === 0 ? (
        <div className="text-slate-400 text-sm">Пока нет комментариев.</div>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              animeId={animeId}
              isAuthed={isAuthed}
              currentUserId={session?.user?.id}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              onReply={handleReply}
              onDelete={handleDelete}
              onRefresh={refreshComments}
              getUserDisplayName={getUserDisplayName}
              getUserInitials={getUserInitials}
              getAvatarUrl={getAvatarUrl}
              expandedReplies={expandedReplies}
              setExpandedReplies={setExpandedReplies}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

function CommentItem({
  comment,
  animeId,
  isAuthed,
  currentUserId,
  replyingTo,
  setReplyingTo,
  replyContent,
  setReplyContent,
  onReply,
  onDelete,
  onRefresh,
  getUserDisplayName,
  getUserInitials,
  getAvatarUrl,
  expandedReplies,
  setExpandedReplies,
}: {
  comment: CommentItem
  animeId: number
  isAuthed: boolean
  currentUserId?: string
  replyingTo: number | null
  setReplyingTo: (id: number | null) => void
  replyContent: Record<number, string>
  setReplyContent: (updater: (prev: Record<number, string>) => Record<number, string>) => void
  onReply: (parentId: number) => void
  onDelete: (commentId: number) => void
  onRefresh: () => void
  getUserDisplayName: (c: CommentItem) => string
  getUserInitials: (c: CommentItem) => string
  getAvatarUrl: (c: CommentItem) => string | undefined
  expandedReplies: Set<number>
  setExpandedReplies: (updater: (prev: Set<number>) => Set<number>) => void
}) {
  const isReplying = replyingTo === comment.id
  const hasReplies = comment.replies && comment.replies.length > 0
  const isExpanded = expandedReplies.has(comment.id)
  const isOwnComment = currentUserId === comment.user_id
  
  const toggleReplies = () => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev)
      if (newSet.has(comment.id)) {
        newSet.delete(comment.id)
      } else {
        newSet.add(comment.id)
      }
      return newSet
    })
  }

  return (
    <li className="flex gap-3">
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={getAvatarUrl(comment)} />
        <AvatarFallback className="text-xs">{getUserInitials(comment)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Link 
            href={`/profile/${comment.user_id}`}
            className="text-sm font-medium text-white hover:text-purple-400 transition-colors"
          >
            {getUserDisplayName(comment)}
          </Link>
          <span className="text-xs text-slate-500">
            {new Date(comment.created_at).toLocaleString("ru-RU", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <div className="text-slate-300 text-sm whitespace-pre-wrap mb-2">
          {comment.deleted_at ? (
            <span className="italic text-slate-500">Сообщение удалено</span>
          ) : (
            comment.content
          )}
        </div>
        
        {isAuthed && !comment.deleted_at && (
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-slate-400 hover:text-slate-200"
              onClick={() => setReplyingTo(isReplying ? null : comment.id)}
            >
              <Reply className="h-3 w-3 mr-1" />
              {isReplying ? "Отмена" : "Ответить"}
            </Button>
            {isOwnComment && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                onClick={() => onDelete(comment.id)}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Удалить
              </Button>
            )}
          </div>
        )}

        {isReplying && (
          <div className="ml-4 mt-2 space-y-2 border-l-2 border-slate-700 pl-4">
            <Textarea
              value={replyContent[comment.id] || ""}
              onChange={(e) =>
                setReplyContent((prev) => ({
                  ...prev,
                  [comment.id]: e.target.value,
                }))
              }
              placeholder="Напишите ответ..."
              className="min-h-[80px] bg-slate-800 border-slate-700 text-white"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReplyingTo(null)}
              >
                Отмена
              </Button>
              <Button
                size="sm"
                onClick={() => onReply(comment.id)}
                disabled={!replyContent[comment.id]?.trim()}
              >
                Отправить
              </Button>
            </div>
          </div>
        )}

        {hasReplies && (
          <>
            <button
              onClick={toggleReplies}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors mb-2"
            >
              {isExpanded ? (
                <>
                  <ChevronDown className="h-3 w-3" />
                  Скрыть ответы ({comment.replies!.length})
                </>
              ) : (
                <>
                  <ChevronRight className="h-3 w-3" />
                  Показать ответы ({comment.replies!.length})
                </>
              )}
            </button>
            {isExpanded && (
              <ul className="mt-2 ml-4 space-y-3 border-l-2 border-slate-700 pl-4">
                {comment.replies!.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    animeId={animeId}
                    isAuthed={isAuthed}
                    currentUserId={currentUserId}
                    replyingTo={replyingTo}
                    setReplyingTo={setReplyingTo}
                    replyContent={replyContent}
                    setReplyContent={setReplyContent}
                    onReply={onReply}
                    onDelete={onDelete}
                    onRefresh={onRefresh}
                    getUserDisplayName={getUserDisplayName}
                    getUserInitials={getUserInitials}
                    getAvatarUrl={getAvatarUrl}
                    expandedReplies={expandedReplies}
                    setExpandedReplies={setExpandedReplies}
                  />
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </li>
  )
}


