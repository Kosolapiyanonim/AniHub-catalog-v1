"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, Image as ImageIcon, Loader2 } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import { getProxiedImageUrl } from "@/lib/image-utils"

interface Anime {
  id: number
  shikimori_id: string
  title: string
  title_orig?: string | null
  year?: number | null
  poster_url?: string | null
  description?: string | null
  status?: string | null
  episodes_count?: number | null
  episodes_total?: number | null
  episodes_aired?: number | null
  shikimori_rating?: number | null
  shikimori_votes?: number | null
  kinopoisk_rating?: number | null
  kinopoisk_votes?: number | null
  imdb_rating?: number | null
}

export default function EditAnimePage() {
  const params = useParams()
  const router = useRouter()
  const animeId = params.id as string

  const [anime, setAnime] = useState<Anime | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<Anime>>({})

  useEffect(() => {
    const fetchAnime = async () => {
      try {
        const response = await fetch(`/api/admin/anime/${animeId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch anime")
        }
        const data = await response.json()
        setAnime(data)
        setFormData(data)
      } catch (err) {
        toast.error("Не удалось загрузить данные аниме")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (animeId) {
      fetchAnime()
    }
  }, [animeId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/admin/anime/${animeId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update anime")
      }

      const data = await response.json()
      toast.success("Аниме успешно обновлено")
      setAnime(data.anime)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Не удалось обновить аниме")
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof Anime, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value === "" ? null : value,
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  if (!anime) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400">Аниме не найдено</div>
      </div>
    )
  }

  const proxiedPosterUrl = getProxiedImageUrl(formData.poster_url || anime.poster_url)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-white">Редактирование аниме</h1>
          <p className="text-slate-400">ID: {anime.id} | Shikimori ID: {anime.shikimori_id}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Poster */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Постер
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-[3/4] relative rounded-lg overflow-hidden bg-slate-900">
                  {proxiedPosterUrl ? (
                    <Image
                      src={proxiedPosterUrl}
                      alt={formData.title || anime.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-500">
                      Нет постера
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="poster_url" className="text-slate-300">
                    URL постера
                  </Label>
                  <Input
                    id="poster_url"
                    value={formData.poster_url || ""}
                    onChange={(e) => handleChange("poster_url", e.target.value)}
                    placeholder="https://..."
                    className="bg-slate-900 border-slate-700 mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column - Form fields */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Основная информация</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-slate-300">
                    Название *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title || ""}
                    onChange={(e) => handleChange("title", e.target.value)}
                    required
                    className="bg-slate-900 border-slate-700 mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="title_orig" className="text-slate-300">
                    Оригинальное название
                  </Label>
                  <Input
                    id="title_orig"
                    value={formData.title_orig || ""}
                    onChange={(e) => handleChange("title_orig", e.target.value)}
                    className="bg-slate-900 border-slate-700 mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="year" className="text-slate-300">
                      Год
                    </Label>
                    <Input
                      id="year"
                      type="number"
                      value={formData.year || ""}
                      onChange={(e) => handleChange("year", e.target.value ? parseInt(e.target.value) : null)}
                      className="bg-slate-900 border-slate-700 mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="status" className="text-slate-300">
                      Статус
                    </Label>
                    <Input
                      id="status"
                      value={formData.status || ""}
                      onChange={(e) => handleChange("status", e.target.value)}
                      className="bg-slate-900 border-slate-700 mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="text-slate-300">
                    Описание
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) => handleChange("description", e.target.value)}
                    rows={6}
                    className="bg-slate-900 border-slate-700 mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Эпизоды</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="episodes_count" className="text-slate-300">
                      Всего эпизодов
                    </Label>
                    <Input
                      id="episodes_count"
                      type="number"
                      value={formData.episodes_count || ""}
                      onChange={(e) => handleChange("episodes_count", e.target.value ? parseInt(e.target.value) : null)}
                      className="bg-slate-900 border-slate-700 mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="episodes_total" className="text-slate-300">
                      Всего (планируется)
                    </Label>
                    <Input
                      id="episodes_total"
                      type="number"
                      value={formData.episodes_total || ""}
                      onChange={(e) => handleChange("episodes_total", e.target.value ? parseInt(e.target.value) : null)}
                      className="bg-slate-900 border-slate-700 mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="episodes_aired" className="text-slate-300">
                      Вышло эпизодов
                    </Label>
                    <Input
                      id="episodes_aired"
                      type="number"
                      value={formData.episodes_aired || ""}
                      onChange={(e) => handleChange("episodes_aired", e.target.value ? parseInt(e.target.value) : null)}
                      className="bg-slate-900 border-slate-700 mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Рейтинги</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="shikimori_rating" className="text-slate-300">
                      Shikimori рейтинг
                    </Label>
                    <Input
                      id="shikimori_rating"
                      type="number"
                      step="0.1"
                      value={formData.shikimori_rating || ""}
                      onChange={(e) => handleChange("shikimori_rating", e.target.value ? parseFloat(e.target.value) : null)}
                      className="bg-slate-900 border-slate-700 mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="shikimori_votes" className="text-slate-300">
                      Shikimori голосов
                    </Label>
                    <Input
                      id="shikimori_votes"
                      type="number"
                      value={formData.shikimori_votes || ""}
                      onChange={(e) => handleChange("shikimori_votes", e.target.value ? parseInt(e.target.value) : null)}
                      className="bg-slate-900 border-slate-700 mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="kinopoisk_rating" className="text-slate-300">
                      Кинопоиск рейтинг
                    </Label>
                    <Input
                      id="kinopoisk_rating"
                      type="number"
                      step="0.1"
                      value={formData.kinopoisk_rating || ""}
                      onChange={(e) => handleChange("kinopoisk_rating", e.target.value ? parseFloat(e.target.value) : null)}
                      className="bg-slate-900 border-slate-700 mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="imdb_rating" className="text-slate-300">
                    IMDB рейтинг
                  </Label>
                  <Input
                    id="imdb_rating"
                    type="number"
                    step="0.1"
                    value={formData.imdb_rating || ""}
                    onChange={(e) => handleChange("imdb_rating", e.target.value ? parseFloat(e.target.value) : null)}
                    className="bg-slate-900 border-slate-700 mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Отмена
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Сохранить изменения
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}





