"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function TestApiPage() {
  const [apiResponse, setApiResponse] = useState("")
  const [loading, setLoading] = useState(false)
  const [animeId, setAnimeId] = useState("")

  const testApi = async (endpoint: string, method = "GET", body?: any) => {
    setLoading(true)
    setApiResponse("Loading...")
    try {
      const options: RequestInit = { method }
      if (body) {
        options.headers = { "Content-Type": "application/json" }
        options.body = JSON.stringify(body)
      }
      const response = await fetch(endpoint, options)
      const data = await response.json()
      setApiResponse(JSON.stringify(data, null, 2))
    } catch (error: any) {
      setApiResponse(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Тестирование API</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Тест /api/test</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => testApi("/api/test")} disabled={loading}>
              Тест API
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Тест /api/catalog</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => testApi("/api/catalog?page=1&limit=5")} disabled={loading}>
              Получить каталог (5 аниме)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Тест /api/anime/[id]</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="anime-id">ID аниме (shikimori_id)</Label>
              <Input
                id="anime-id"
                value={animeId}
                onChange={(e) => setAnimeId(e.target.value)}
                placeholder="Например: 1"
                disabled={loading}
              />
              <Button onClick={() => testApi(`/api/anime/${animeId}`)} disabled={loading || !animeId}>
                Получить аниме по ID
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Тест /api/genres</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => testApi("/api/genres")} disabled={loading}>
              Получить жанры
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Тест /api/years</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => testApi("/api/years")} disabled={loading}>
              Получить года
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Тест /api/types</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => testApi("/api/types")} disabled={loading}>
              Получить типы
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Тест /api/statuses</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => testApi("/api/statuses")} disabled={loading}>
              Получить статусы
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Тест /api/studios</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => testApi("/api/studios")} disabled={loading}>
              Получить студии
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Тест /api/tags</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => testApi("/api/tags")} disabled={loading}>
              Получить теги
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Тест /api/homepage-sections</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => testApi("/api/homepage-sections")} disabled={loading}>
              Получить секции главной
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Тест /api/search</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => testApi("/api/search?q=naruto&limit=3")} disabled={loading}>
              Поиск "naruto" (3 результата)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Тест /api/lists (POST)</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => testApi("/api/lists", "POST", { animeId: 1, status: "watching" })}
              disabled={loading}
            >
              Добавить в список (animeId: 1, watching)
            </Button>
            <Button
              onClick={() => testApi("/api/lists", "POST", { animeId: 1, status: "completed" })}
              disabled={loading}
              className="mt-2"
            >
              Обновить статус (animeId: 1, completed)
            </Button>
            <Button
              onClick={() => testApi("/api/lists", "POST", { animeId: 1, status: null })}
              disabled={loading}
              className="mt-2"
            >
              Удалить из списка (animeId: 1)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Тест /api/subscriptions (POST)</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => testApi("/api/subscriptions", "POST", { email: "test@example.com" })}
              disabled={loading}
            >
              Подписаться (test@example.com)
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ответ API</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            className="min-h-[300px] font-mono text-xs"
            value={apiResponse}
            readOnly
            placeholder="Здесь будет отображаться ответ API..."
          />
        </CardContent>
      </Card>
    </div>
  )
}
