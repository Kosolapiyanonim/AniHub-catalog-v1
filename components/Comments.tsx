"use client"

import { useEffect, useState } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type CommentItem = {
  id: number
  anime_id: number
  user_id: string
  content: string
  created_at: string
  profiles?: { username?: string | null; avatar_url?: string | null } | null
}

export default function Comments({ animeId }: { animeId: number }) {
  const { supabase, session } = useSupabase()
  const [comments, setComments] = useState<CommentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [content, setContent] = useState("")
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
    })
    if (res.ok) {
      setContent("")
      // Refresh list
      const refreshed = await fetch(`/api/comments?animeId=${animeId}`, { cache: "no-store" })
      if (refreshed.ok) setComments(await refreshed.json())
    }
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
        <ul className="space-y-3">
          {comments.map((c) => (
            <li key={c.id} className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={undefined} />
                <AvatarFallback>US</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="text-sm text-white">
                  Пользователь
                  <span className="ml-2 text-xs text-slate-500">
                    {new Date(c.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="text-slate-300 text-sm whitespace-pre-wrap">{c.content}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}


