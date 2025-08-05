"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

export default function ParserPage() {
  const [url, setUrl] = useState("")
  const [output, setOutput] = useState("")
  const [loading, setLoading] = useState(false)
  const [parserType, setParserType] = useState("single") // 'single' or 'full'
  const [parseLatestCount, setParseLatestCount] = useState(10)
  const [parseLatestOffset, setParseLatestOffset] = useState(0)
  const [parseLatestForce, setParseLatestForce] = useState(false)
  const { toast } = useToast()

  const handleParseSinglePage = async () => {
    if (!url) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, введите URL для парсинга.",
        variant: "destructive",
      })
      return
    }
    setLoading(true)
    setOutput("Парсинг страницы...")
    try {
      const response = await fetch("/api/parse-single-page", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })
      const data = await response.json()
      if (response.ok) {
        setOutput(JSON.stringify(data, null, 2))
        toast({
          title: "Успех",
          description: "Страница успешно спарсена.",
        })
      } else {
        setOutput(`Ошибка: ${data.error || response.statusText}`)
        toast({
          title: "Ошибка",
          description: `Не удалось спарсить страницу: ${data.error || response.statusText}`,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      setOutput(`Ошибка: ${error.message}`)
      toast({
        title: "Ошибка",
        description: `Произошла ошибка при парсинге: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleParseLatest = async () => {
    setLoading(true)
    setOutput("Парсинг последних аниме...")
    try {
      const response = await fetch("/api/parse-latest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ count: parseLatestCount, offset: parseLatestOffset, force: parseLatestForce }),
      })
      const data = await response.json()
      if (response.ok) {
        setOutput(JSON.stringify(data, null, 2))
        toast({
          title: "Успех",
          description: `Спарсено ${data.parsedCount} новых аниме.`,
        })
      } else {
        setOutput(`Ошибка: ${data.error || response.statusText}`)
        toast({
          title: "Ошибка",
          description: `Не удалось спарсить последние аниме: ${data.error || response.statusText}`,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      setOutput(`Ошибка: ${error.message}`)
      toast({
        title: "Ошибка",
        description: `Произошла ошибка при парсинге: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFullParse = async () => {
    setLoading(true)
    setOutput("Запущен полный парсинг...")
    try {
      const response = await fetch("/api/full-parser", {
        method: "POST",
      })
      const data = await response.json()
      if (response.ok) {
        setOutput(JSON.stringify(data, null, 2))
        toast({
          title: "Успех",
          description: "Полный парсинг успешно завершен.",
        })
      } else {
        setOutput(`Ошибка: ${data.error || response.statusText}`)
        toast({
          title: "Ошибка",
          description: `Не удалось выполнить полный парсинг: ${data.error || response.statusText}`,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      setOutput(`Ошибка: ${error.message}`)
      toast({
        title: "Ошибка",
        description: `Произошла ошибка при полном парсинге: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Панель управления парсером</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Выбор типа парсинга</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={parserType} onValueChange={setParserType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Выберите тип парсинга" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Парсинг одной страницы</SelectItem>
              <SelectItem value="latest">Парсинг последних аниме</SelectItem>
              <SelectItem value="full">Полный парсинг</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {parserType === "single" && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Парсинг одной страницы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="url">URL страницы аниме</Label>
                <Input
                  id="url"
                  placeholder="Например: https://kodik.info/anime/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button onClick={handleParseSinglePage} disabled={loading}>
                {loading ? "Парсинг..." : "Спарсить страницу"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {parserType === "latest" && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Парсинг последних аниме</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="count">Количество аниме для парсинга</Label>
                <Input
                  id="count"
                  type="number"
                  value={parseLatestCount}
                  onChange={(e) => setParseLatestCount(Number(e.target.value))}
                  disabled={loading}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="offset">Смещение (offset)</Label>
                <Input
                  id="offset"
                  type="number"
                  value={parseLatestOffset}
                  onChange={(e) => setParseLatestOffset(Number(e.target.value))}
                  disabled={loading}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="force-parse"
                  checked={parseLatestForce}
                  onCheckedChange={(checked) => setParseLatestForce(Boolean(checked))}
                  disabled={loading}
                />
                <Label htmlFor="force-parse">Принудительный парсинг (обновить существующие)</Label>
              </div>
              <Button onClick={handleParseLatest} disabled={loading}>
                {loading ? "Парсинг..." : "Спарсить последние"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {parserType === "full" && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Полный парсинг</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Запускает полный парсинг всех доступных аниме. Это может занять много времени.
            </p>
            <Button onClick={handleFullParse} disabled={loading}>
              {loading ? "Запуск..." : "Запустить полный парсинг"}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Вывод парсера</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            className="min-h-[300px] font-mono text-xs"
            value={output}
            readOnly
            placeholder="Здесь будет отображаться вывод парсера..."
          />
        </CardContent>
      </Card>
    </div>
  )
}
