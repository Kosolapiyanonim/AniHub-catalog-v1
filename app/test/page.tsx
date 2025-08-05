// /app/test/page.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/loading-spinner"

// Ключевой момент - "export default"
export default function TestApiPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [testType, setTestType] = useState<string>("")

  const runTest = async (testName: string, url: string) => {
    setLoading(true)
    setError(null)
    setData(null)
    setTestType(testName)

    try {
      const response = await fetch(url)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`)
      }
      setData(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Тестовая страница</h1>
      <Button onClick={() => runTest("Popular Anime", "/api/catalog?sort=shikimori_votes&limit=5")} disabled={loading}>
        Тест: Популярное
      </Button>
      <Button onClick={() => runTest("Search Test", "/api/catalog?title=naruto")} disabled={loading}>
        Тест: Поиск "Наруто"
      </Button>
      {loading && (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {error && (
        <Card className="border-red-500 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">❌ {testType} провален</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 font-mono">{error}</p>
          </CardContent>
        </Card>
      )}

      {data && (
        <Card className="border-green-500 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">✅ {testType} успешно</CardTitle>
          </CardHeader>
          <CardContent>
            <details>
              <summary className="cursor-pointer font-semibold">Показать полный ответ</summary>
              <pre className="bg-gray-100 p-4 rounded-lg mt-2 overflow-auto text-xs max-h-96 border">
                {JSON.stringify(data, null, 2)}
              </pre>
            </details>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
