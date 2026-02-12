"use client"

import { useState, useEffect } from "react"
import { AdminTable } from "@/components/admin/admin-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, MessageSquare, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

interface Comment {
  id: number
  anime_id: number
  user_id: string
  content: string
  created_at: string
  deleted_at: string | null
  profiles: {
    username: string | null
    avatar_url: string | null
  } | null
  animes: {
    title: string
    shikimori_id: string
  } | null
}

export default function ModerateCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetchComments()
  }, [filter])

  const fetchComments = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/moderate/comments?filter=${filter}`)
      if (!response.ok) {
        throw new Error("Failed to fetch comments")
      }
      const data = await response.json()
      setComments(data.comments || [])
    } catch (err) {
      toast.error("Не удалось загрузить комментарии")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (commentId: number) => {
    if (!confirm("Вы уверены, что хотите удалить этот комментарий?")) {
      return
    }

    setDeletingIds((prev) => new Set(prev).add(commentId))
    try {
      const response = await fetch(`/api/admin/moderate/comments?id=${commentId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to delete comment")
      }

      toast.success("Комментарий удален")
      fetchComments()
    } catch (err) {
      toast.error("Не удалось удалить комментарий")
    } finally {
      setDeletingIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(commentId)
        return newSet
      })
    }
  }

  const getUserDisplayName = (comment: Comment) => {
    return comment.profiles?.username || `user_${comment.user_id.slice(0, 8)}`
  }

  const getUserInitials = (comment: Comment) => {
    const name = comment.profiles?.username || comment.user_id
    return name?.charAt(0).toUpperCase() || "U"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Модерация комментариев</h1>
          <p className="text-slate-400">Всего комментариев: {comments.length}</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все</SelectItem>
              <SelectItem value="recent">За 24 часа</SelectItem>
              <SelectItem value="deleted">Удаленные</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchComments}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Обновить
          </Button>
        </div>
      </div>

      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-0">
          <AdminTable
            data={comments}
            columns={[
              {
                key: "id",
                label: "ID",
              },
              {
                key: "user",
                label: "Пользователь",
                render: (_, row) => (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={row.profiles?.avatar_url || undefined} />
                      <AvatarFallback className="bg-slate-700 text-slate-300 text-xs">
                        {getUserInitials(row)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{getUserDisplayName(row)}</span>
                  </div>
                ),
              },
              {
                key: "anime",
                label: "Аниме",
                render: (_, row) => (
                  row.animes ? (
                    <Link
                      href={`/anime/${row.animes.shikimori_id}`}
                      className="text-purple-400 hover:text-purple-300"
                    >
                      {row.animes.title}
                    </Link>
                  ) : (
                    <span className="text-slate-500">Не найдено</span>
                  )
                ),
              },
              {
                key: "content",
                label: "Комментарий",
                render: (value, row) => (
                  <div className="max-w-md">
                    <p className="text-sm text-slate-300 line-clamp-2">
                      {row.deleted_at ? (
                        <span className="italic text-slate-500">Сообщение удалено</span>
                      ) : (
                        value
                      )}
                    </p>
                  </div>
                ),
              },
              {
                key: "created_at",
                label: "Дата",
                render: (value) => (
                  <span className="text-sm text-slate-400">
                    {new Date(value).toLocaleString("ru-RU")}
                  </span>
                ),
              },
              {
                key: "status",
                label: "Статус",
                render: (_, row) => (
                  row.deleted_at ? (
                    <Badge variant="outline" className="border-red-500/50 text-red-400">
                      Удален
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-green-500/50 text-green-400">
                      Активен
                    </Badge>
                  )
                ),
              },
              {
                key: "actions",
                label: "Действия",
                render: (_, row) => (
                  !row.deleted_at && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(row.id)}
                      disabled={deletingIds.has(row.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      {deletingIds.has(row.id) ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Удалить
                        </>
                      )}
                    </Button>
                  )
                ),
              },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  )
}

