"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from 'lucide-react'

export default function ParserPage() {
  const [url, setUrl] = useState("")
  const [status, setStatus] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleParseSinglePage = async () => {
    setIsLoading(true)
    setStatus("Запуск парсинга одной страницы...")
    try {
      const response = await fetch(`/api/parse-single-page?url=${encodeURIComponent(url)}`)
      const data = await response.json()
      if (response.ok) {
        setStatus(`Успешно: ${JSON.stringify(data, null, 2)}`)
        toast({
          title: "Парсинг завершен",
          description: "Страница успешно обработана.",
        })
      } else {
        setStatus(`Ошибка: ${data.error || "Неизвестная ошибка"}`)
        toast({
          title: "Ошибка парсинга",
          description: data.error || "Произошла ошибка при обработке страницы.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      setStatus(`Ошибка: ${error.message}`)
      toast({
        title: "Ошибка парсинга",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleParseLatest = async () => {
    setIsLoading(true)
    setStatus("Запуск парсинга последних обновлений...")
    try {
      const response = await fetch("/api/parse-latest")
      const data = await response.json()
      if (response.ok) {
        setStatus(`Успешно: ${JSON.stringify(data, null, 2)}`)
        toast({
          title: "Парсинг завершен",
          description: "Последние обновления успешно обработаны.",
        })
      } else {
        setStatus(`Ошибка: ${data.error || "Неизвестная ошибка"}`)
        toast({
          title: "Ошибка парсинга",
          description: data.error || "Произошла ошибка при обработке последних обновлений.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      setStatus(`Ошибка: ${error.message}`)
      toast({
        title: "Ошибка парсинга",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFullParse = async () => {
    setIsLoading(true)
    setStatus("Запуск полного парсинга (может занять много времени)...")
    try {
      const response = await fetch("/api/full-parser")
      const data = await response.json()
      if (response.ok) {
        setStatus(`Успешно: ${JSON.stringify(data, null, 2)}`)
        toast({
          title: "Полный парсинг завершен",
          description: "Все аниме успешно обработаны.",
        })
      } else {
        setStatus(`Ошибка: ${data.error || "Неизвестная ошибка"}`)
        toast({
          title: "Ошибка полного парсинга",
          description: data.error || "Произошла ошибка при полном парсинге.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      setStatus(`Ошибка: ${error.message}`)
      toast({
        title: "Ошибка полного парсинга",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Панель администратора: Парсер Kodik</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Парсинг одной страницы</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="url" className="text-slate-300">URL страницы Kodik</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://kodik.info/anime/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <Button
              onClick={handleParseSinglePage}
              disabled={isLoading || !url}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Парсить страницу
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Парсинг последних обновлений</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-400">
              Запускает парсинг последних обновлений аниме из Kodik API.
              Это быстрее, чем полный парсинг, и подходит для регулярного обновления.
            </p>
            <Button
              onClick={handleParseLatest}
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Парсить последние
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Полный парсинг</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-400">
              Запускает полный парсинг всех доступных аниме из Kodik API.
              Это может занять очень много времени и потребляет много ресурсов.
              Используйте осторожно.
            </p>
            <Button
              onClick={handleFullParse}
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Запустить полный парсинг
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Статус парсинга</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={status}
              readOnly
              rows={10}
              className="w-full bg-slate-700 border-slate-600 text-white font-mono text-sm"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
