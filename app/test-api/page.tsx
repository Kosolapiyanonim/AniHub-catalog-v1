'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

export default function TestApiPage() {
  const [apiResponse, setApiResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [animeId, setAnimeId] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [parsePage, setParsePage] = useState('1')

  const handleApiCall = async (endpoint: string, method: string = 'GET', body?: any) => {
    setLoading(true)
    setApiResponse(null)
    try {
      const options: RequestInit = { method }
      if (body) {
        options.headers = { 'Content-Type': 'application/json' }
        options.body = JSON.stringify(body)
      }
      const response = await fetch(`/api/${endpoint}`, options)
      const data = await response.json()
      setApiResponse(data)
      if (!response.ok) {
        toast.error(data.error || `Ошибка при вызове ${endpoint}`)
      } else {
        toast.success(`Успешный вызов ${endpoint}`)
      }
    } catch (error: any) {
      console.error('API call error:', error)
      setApiResponse({ error: error.message || 'Неизвестная ошибка' })
      toast.error('Произошла ошибка при вызове API.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container mx-auto px-4 py-8 mt-16">
      <h1 className="text-3xl font-bold mb-8 text-center">Тестирование API</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Test /api/test */}
        <Card>
          <CardHeader>
            <CardTitle>/api/test</CardTitle>
            <CardDescription>Проверяет статус пользователя.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => handleApiCall('test')} disabled={loading} className="w-full">
              {loading ? 'Загрузка...' : 'Проверить пользователя'}
            </Button>
          </CardContent>
        </Card>

        {/* Test /api/catalog */}
        <Card>
          <CardHeader>
            <CardTitle>/api/catalog</CardTitle>
            <CardDescription>Получает список аниме из каталога.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => handleApiCall('catalog?page=1&limit=5')} disabled={loading} className="w-full">
              {loading ? 'Загрузка...' : 'Получить каталог (5 аниме)'}
            </Button>
          </CardContent>
        </Card>

        {/* Test /api/anime/[id] */}
        <Card>
          <CardHeader>
            <CardTitle>/api/anime/[id]</CardTitle>
            <CardDescription>Получает аниме по ID.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="anime-id">ID Аниме</Label>
              <Input id="anime-id" value={animeId} onChange={(e) => setAnimeId(e.target.value)} placeholder="Например, 1" />
            </div>
            <Button onClick={() => handleApiCall(`anime/${animeId}`)} disabled={loading || !animeId} className="w-full">
              {loading ? 'Загрузка...' : 'Получить аниме по ID'}
            </Button>
          </CardContent>
        </Card>

        {/* Test /api/search */}
        <Card>
          <CardHeader>
            <CardTitle>/api/search</CardTitle>
            <CardDescription>Ищет аниме по названию.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="search-query">Поисковый запрос</Label>
              <Input id="search-query" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Например, Наруто" />
            </div>
            <Button onClick={() => handleApiCall(`search?query=${searchQuery}`)} disabled={loading || !searchQuery} className="w-full">
              {loading ? 'Загрузка...' : 'Найти аниме'}
            </Button>
          </CardContent>
        </Card>

        {/* Test /api/parse-latest */}
        <Card>
          <CardHeader>
            <CardTitle>/api/parse-latest (POST)</CardTitle>
            <CardDescription>Запускает парсинг последних аниме.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => handleApiCall('parse-latest', 'POST')} disabled={loading} className="w-full">
              {loading ? 'Загрузка...' : 'Запустить парсинг последних'}
            </Button>
          </CardContent>
        </Card>

        {/* Test /api/parse-single-page */}
        <Card>
          <CardHeader>
            <CardTitle>/api/parse-single-page (POST)</CardTitle>
            <CardDescription>Парсит аниме с одной страницы.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="parse-page">Номер страницы</Label>
              <Input id="parse-page" type="number" value={parsePage} onChange={(e) => setParsePage(e.target.value)} min={1} />
            </div>
            <Button onClick={() => handleApiCall('parse-single-page', 'POST', { page: parseInt(parsePage) })} disabled={loading || !parsePage} className="w-full">
              {loading ? 'Загрузка...' : `Парсить страницу ${parsePage}`}
            </Button>
          </CardContent>
        </Card>

        {/* Test /api/full-parser */}
        <Card>
          <CardHeader>
            <CardTitle>/api/full-parser (POST)</CardTitle>
            <CardDescription>Запускает полный парсинг (может занять много времени).</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => handleApiCall('full-parser', 'POST')} disabled={loading} className="w-full" variant="destructive">
              {loading ? 'Загрузка...' : 'Запустить полный парсинг'}
            </Button>
          </CardContent>
        </Card>

        {/* Test /api/genres */}
        <Card>
          <CardHeader>
            <CardTitle>/api/genres</CardTitle>
            <CardDescription>Получает список всех жанров.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => handleApiCall('genres')} disabled={loading} className="w-full">
              {loading ? 'Загрузка...' : 'Получить жанры'}
            </Button>
          </CardContent>
        </Card>

        {/* Test /api/years */}
        <Card>
          <CardHeader>
            <CardTitle>/api/years</CardTitle>
            <CardDescription>Получает список всех годов выпуска.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => handleApiCall('years')} disabled={loading} className="w-full">
              {loading ? 'Загрузка...' : 'Получить годы'}
            </Button>
          </CardContent>
        </Card>

        {/* Test /api/statuses */}
        <Card>
          <CardHeader>
            <CardTitle>/api/statuses</CardTitle>
            <CardDescription>Получает список всех статусов аниме.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => handleApiCall('statuses')} disabled={loading} className="w-full">
              {loading ? 'Загрузка...' : 'Получить статусы'}
            </Button>
          </CardContent>
        </Card>

        {/* Test /api/types */}
        <Card>
          <CardHeader>
            <CardTitle>/api/types</CardTitle>
            <CardDescription>Получает список всех типов аниме.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => handleApiCall('types')} disabled={loading} className="w-full">
              {loading ? 'Загрузка...' : 'Получить типы'}
            </Button>
          </CardContent>
        </Card>

        {/* Test /api/studios */}
        <Card>
          <CardHeader>
            <CardTitle>/api/studios</CardTitle>
            <CardDescription>Получает список всех студий.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => handleApiCall('studios')} disabled={loading} className="w-full">
              {loading ? 'Загрузка...' : 'Получить студии'}
            </Button>
          </CardContent>
        </Card>

        {/* Test /api/lists (GET) */}
        <Card>
          <CardHeader>
            <CardTitle>/api/lists (GET)</CardTitle>
            <CardDescription>Получает списки пользователя (требуется авторизация).</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => handleApiCall('lists?userId=YOUR_USER_ID')} disabled={loading} className="w-full">
              {loading ? 'Загрузка...' : 'Получить списки'}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">Замените YOUR_USER_ID на реальный ID пользователя.</p>
          </CardContent>
        </Card>

        {/* Test /api/lists (POST) */}
        <Card>
          <CardHeader>
            <CardTitle>/api/lists (POST)</CardTitle>
            <CardDescription>Добавляет аниме в список (требуется авторизация).</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => handleApiCall('lists', 'POST', { userId: 'YOUR_USER_ID', animeId: 'ANIME_ID', listName: 'watching' })} disabled={loading} className="w-full">
              {loading ? 'Загрузка...' : 'Добавить в список "Смотрю"'}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">Замените YOUR_USER_ID и ANIME_ID.</p>
          </CardContent>
        </Card>

        {/* Test /api/lists (DELETE) */}
        <Card>
          <CardHeader>
            <CardTitle>/api/lists (DELETE)</CardTitle>
            <CardDescription>Удаляет аниме из списка (требуется авторизация).</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => handleApiCall('lists', 'DELETE', { userId: 'YOUR_USER_ID', animeId: 'ANIME_ID', listName: 'watching' })} disabled={loading} className="w-full" variant="destructive">
              {loading ? 'Загрузка...' : 'Удалить из списка "Смотрю"'}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">Замените YOUR_USER_ID и ANIME_ID.</p>
          </CardContent>
        </Card>

        {/* Test /api/subscriptions (GET) */}
        <Card>
          <CardHeader>
            <CardTitle>/api/subscriptions (GET)</CardTitle>
            <CardDescription>Получает подписки пользователя (требуется авторизация).</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => handleApiCall('subscriptions?userId=YOUR_USER_ID')} disabled={loading} className="w-full">
              {loading ? 'Загрузка...' : 'Получить подписки'}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">Замените YOUR_USER_ID.</p>
          </CardContent>
        </Card>

        {/* Test /api/subscriptions (POST) */}
        <Card>
          <CardHeader>
            <CardTitle>/api/subscriptions (POST)</CardTitle>
            <CardDescription>Добавляет подписку на аниме (требуется авторизация).</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => handleApiCall('subscriptions', 'POST', { userId: 'YOUR_USER_ID', animeId: 'ANIME_ID' })} disabled={loading} className="w-full">
              {loading ? 'Загрузка...' : 'Подписаться'}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">Замените YOUR_USER_ID и ANIME_ID.</p>
          </CardContent>
        </Card>

        {/* Test /api/subscriptions (DELETE) */}
        <Card>
          <CardHeader>
            <CardTitle>/api/subscriptions (DELETE)</CardTitle>
            <CardDescription>Удаляет подписку на аниме (требуется авторизация).</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => handleApiCall('subscriptions', 'DELETE', { userId: 'YOUR_USER_ID', animeId: 'ANIME_ID' })} disabled={loading} className="w-full" variant="destructive">
              {loading ? 'Загрузка...' : 'Отписаться'}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">Замените YOUR_USER_ID и ANIME_ID.</p>
          </CardContent>
        </Card>
      </div>

      {apiResponse && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Ответ API</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              readOnly
              value={JSON.stringify(apiResponse, null, 2)}
              className="min-h-[200px] font-mono text-sm"
            />
          </CardContent>
        </Card>
      )}
    </main>
  )
}
