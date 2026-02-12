"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Save, CheckSquare, Square } from "lucide-react"
import { toast } from "sonner"

interface Anime {
  id: number
  title: string
  shikimori_id: string
  status: string | null
  year: number | null
}

export default function BulkEditPage() {
  const [animes, setAnimes] = useState<Anime[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [bulkField, setBulkField] = useState<string>("")
  const [bulkValue, setBulkValue] = useState<string>("")

  useEffect(() => {
    const fetchAnimes = async () => {
      try {
        const response = await fetch("/api/catalog?limit=500")
        if (!response.ok) {
          throw new Error("Failed to fetch animes")
        }
        const data = await response.json()
        setAnimes(data.animes || [])
      } catch (err) {
        toast.error("Не удалось загрузить аниме")
      } finally {
        setLoading(false)
      }
    }

    fetchAnimes()
  }, [])

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === animes.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(animes.map((a) => a.id)))
    }
  }

  const handleBulkUpdate = async () => {
    if (selectedIds.size === 0) {
      toast.error("Выберите хотя бы одно аниме")
      return
    }

    if (!bulkField) {
      toast.error("Выберите поле для обновления")
      return
    }

    setSaving(true)
    try {
      const updates = Array.from(selectedIds).map((id) => ({
        id,
        [bulkField]: bulkValue || null,
      }))

      const response = await fetch("/api/admin/anime/bulk", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ updates }),
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to update animes")
      }

      toast.success(`Обновлено ${selectedIds.size} аниме`)
      setSelectedIds(new Set())
      setBulkField("")
      setBulkValue("")
      
      // Refresh data
      const refreshResponse = await fetch("/api/catalog?limit=500")
      if (refreshResponse.ok) {
        const data = await refreshResponse.json()
        setAnimes(data.animes || [])
      }
    } catch (err) {
      toast.error("Не удалось обновить аниме")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Массовое редактирование</h1>
        <p className="text-slate-400">
          Выбрано: {selectedIds.size} из {animes.length}
        </p>
      </div>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Массовое обновление</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Select value={bulkField} onValueChange={setBulkField}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Выберите поле" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="status">Статус</SelectItem>
                <SelectItem value="year">Год</SelectItem>
              </SelectContent>
            </Select>

            {bulkField && (
              <Input
                value={bulkValue}
                onChange={(e) => setBulkValue(e.target.value)}
                placeholder="Новое значение"
                className="flex-1 max-w-xs"
              />
            )}

            <Button onClick={handleBulkUpdate} disabled={!bulkField || saving || selectedIds.size === 0}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Сохранение..." : `Обновить ${selectedIds.size} аниме`}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Список аниме</CardTitle>
            <Button variant="outline" size="sm" onClick={toggleSelectAll}>
              {selectedIds.size === animes.length ? (
                <>
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Снять выделение
                </>
              ) : (
                <>
                  <Square className="h-4 w-4 mr-2" />
                  Выбрать все
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {animes.map((anime) => (
              <div
                key={anime.id}
                className="flex items-center gap-4 p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"
              >
                <Checkbox
                  checked={selectedIds.has(anime.id)}
                  onCheckedChange={() => toggleSelect(anime.id)}
                />
                <div className="flex-1">
                  <div className="font-medium text-white">{anime.title}</div>
                  <div className="text-sm text-slate-400">
                    ID: {anime.id} | Shikimori: {anime.shikimori_id}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {anime.status && (
                    <Badge variant="outline">{anime.status}</Badge>
                  )}
                  {anime.year && (
                    <Badge variant="outline">{anime.year}</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}





