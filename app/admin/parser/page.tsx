"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Play, Pause, Square, Database, AlertCircle } from "lucide-react"

type LogEntry = {
  type: "info" | "success" | "error"
  message: string
}

export default function ParserControlPage() {
  const [isParsing, setIsParsing] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({ total: 0, pages: 0 })

  const nextPageUrlRef = useRef<string | null>(null)
  const isParsingRef = useRef(false)
  const isPausedRef = useRef(false)

  const addLog = useCallback((message: string, type: LogEntry["type"] = "info") => {
    setLogs((prev) => [...prev, { type, message: `[${new Date().toLocaleTimeString()}] ${message}` }])
  }, [])

  const runParsingProcess = useCallback(async () => {
    if (!isParsingRef.current) {
      setIsParsing(false)
      setIsPaused(false)
      addLog("Парсинг остановлен пользователем.", "error")
      return
    }

    if (isPausedRef.current) {
      addLog("Парсинг на паузе. Нажмите 'Продолжить' для возобновления.", "info")
      return
    }

    addLog(`Запрос страницы ${stats.pages + 1}...`)

    try {
      const response = await fetch("/api/parse-single-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nextPageUrl: nextPageUrlRef.current }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `Ошибка сервера: ${response.status}`)
      }

      const processed = result.processed || 0
      setStats((prev) => ({
        total: prev.total + processed,
        pages: prev.pages + 1,
      }))

      addLog(`Обработано: ${processed} аниме. ${result.message}`, "success")
      setProgress((prev) => Math.min(prev + 2, 95))

      if (result.nextPageUrl) {
        nextPageUrlRef.current = result.nextPageUrl
        setTimeout(runParsingProcess, 1500)
      } else {
        addLog("Парсинг завершен! Все страницы обработаны.", "success")
        setProgress(100)
        isParsingRef.current = false
        setIsParsing(false)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Неизвестная ошибка"
      setError(errorMessage)
      addLog(`Ошибка: ${errorMessage}`, "error")

      addLog("Повторная попытка через 5 секунд...", "info")
      setTimeout(runParsingProcess, 5000)
    }
  }, [addLog, stats.pages])

  const handleStart = () => {
    setLogs([])
    setError(null)
    setProgress(0)
    setStats({ total: 0, pages: 0 })
    setIsPaused(false)
    isPausedRef.current = false
    setIsParsing(true)
    isParsingRef.current = true
    nextPageUrlRef.current = null
    addLog("Запуск парсинга Kodik API...")
    runParsingProcess()
  }

  const handlePause = () => {
    isPausedRef.current = true
    setIsPaused(true)
    addLog("Парсинг приостановлен.", "info")
  }

  const handleResume = () => {
    isPausedRef.current = false
    setIsPaused(false)
    addLog("Возобновление парсинга...")
    runParsingProcess()
  }

  const handleStop = () => {
    isParsingRef.current = false
    isPausedRef.current = false
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-24 min-h-screen">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            <Database className="text-primary" />
            Панель управления парсером
          </CardTitle>
          <p className="text-muted-foreground text-sm">Загрузка аниме из Kodik API в базу данных Supabase</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-4">
            {!isParsing ? (
              <Button onClick={handleStart} size="lg">
                <Play className="mr-2 h-4 w-4" /> Начать парсинг
              </Button>
            ) : (
              <>
                {isPaused ? (
                  <Button onClick={handleResume} variant="default">
                    <Play className="mr-2 h-4 w-4" /> Продолжить
                  </Button>
                ) : (
                  <Button onClick={handlePause} variant="outline">
                    <Pause className="mr-2 h-4 w-4" /> Пауза
                  </Button>
                )}
                <Button onClick={handleStop} variant="destructive">
                  <Square className="mr-2 h-4 w-4" /> Стоп
                </Button>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">Аниме загружено</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{stats.pages}</div>
                <p className="text-xs text-muted-foreground">Страниц обработано</p>
              </CardContent>
            </Card>
          </div>

          {/* Progress */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Прогресс</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">Произошла ошибка</p>
                <p className="text-sm text-destructive/80 font-mono mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Logs */}
          <div>
            <label className="text-sm font-medium mb-2 block">Логи выполнения</label>
            <div className="bg-zinc-950 text-zinc-100 font-mono text-xs rounded-lg p-4 h-80 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-zinc-500">Нажмите "Начать парсинг" для запуска...</p>
              ) : (
                logs.map((log, index) => (
                  <p
                    key={index}
                    className={
                      log.type === "error"
                        ? "text-red-400"
                        : log.type === "success"
                          ? "text-green-400"
                          : "text-zinc-400"
                    }
                  >
                    {log.message}
                  </p>
                ))
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="text-sm text-muted-foreground space-y-1 border-t pt-4">
            <p>
              <strong>Как это работает:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Парсер загружает аниме из Kodik API пачками по 100 штук</li>
              <li>
                Данные сохраняются в таблицу <code>animes</code> в Supabase
              </li>
              <li>Жанры, студии и страны связываются автоматически</li>
              <li>Процесс можно приостановить и продолжить</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
