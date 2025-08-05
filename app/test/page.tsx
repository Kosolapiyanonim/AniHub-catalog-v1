"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export default function TestPage() {
  const [apiResponse, setApiResponse] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const testApi = async () => {
    setLoading(true)
    setApiResponse(null)
    try {
      const response = await fetch("/api/test")
      const data = await response.json()
      setApiResponse(JSON.stringify(data, null, 2))
      if (data.status === "ok") {
        toast.success("API Test Successful!")
      } else {
        toast.error("API Test Failed!", { description: data.message })
      }
    } catch (error) {
      console.error("Error testing API:", error)
      setApiResponse(`Error: ${error instanceof Error ? error.message : String(error)}`)
      toast.error("An unexpected error occurred during API test.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Тестовая страница</h1>
      <Card>
        <CardHeader>
          <CardTitle>Проверить подключение к API</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Нажмите кнопку ниже, чтобы проверить, правильно ли настроено подключение к API.</p>
          <Button onClick={testApi} disabled={loading}>
            {loading ? "Тестирование..." : "Запустить тест API"}
          </Button>
          {apiResponse && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Ответ API:</h3>
              <Textarea value={apiResponse} readOnly rows={10} className="font-mono text-sm bg-muted p-2 rounded-md" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
