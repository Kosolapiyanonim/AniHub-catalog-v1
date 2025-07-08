"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, Database, Wifi } from "lucide-react"

/**
 * Возможные состояния одного сервиса.
 */
type StatusValue = "loading" | "online" | "offline"

interface ApiStatusState {
  parser: StatusValue
  catalog: StatusValue
  database: StatusValue
}

/**
 * Компонент, показывающий состояние основных сервисов сайта.
 *
 * Экспортируется и именованно (`ApiStatus`), и по умолчанию, чтобы
 * любой вариант импорта работал:
 *
 *   import { ApiStatus } from "@/components/api-status"
 *   import ApiStatus from "@/components/api-status"
 */
export function ApiStatus() {
  const [status, setStatus] = useState<ApiStatusState>({
    parser: "loading",
    catalog: "loading",
    database: "loading",
  })
  const [lastChecked, setLastChecked] = useState<string | null>(null)

  /** Запрашиваем статусы всех сервисов параллельно */
  async function checkApiStatus() {
    try {
      const [parserRes, catalogRes, dbRes] = await Promise.allSettled([
        fetch("/api/parser"),
        fetch("/api/catalog?limit=1"),
        fetch("/api/anime/database"),
      ])

      const isOk = (r: PromiseSettledResult<Response>) => r.status === "fulfilled" && r.value.ok

      setStatus({
        parser: isOk(parserRes) ? "online" : "offline",
        catalog: isOk(catalogRes) ? "online" : "offline",
        database: isOk(dbRes) ? "online" : "offline",
      })
    } catch (err) {
      console.error("API status check error:", err)
      setStatus({ parser: "offline", catalog: "offline", database: "offline" })
    } finally {
      setLastChecked(new Date().toLocaleTimeString())
    }
  }

  /** Первый запрос и интервал раз в 30 секунд */
  useEffect(() => {
    checkApiStatus()
    const id = setInterval(checkApiStatus, 30_000)
    return () => clearInterval(id)
  }, [])

  /* Вспомогательные элементы UI */
  const icon = (s: StatusValue) =>
    s === "loading" ? (
      <Clock className="w-4 h-4 text-yellow-500 animate-spin" />
    ) : s === "online" ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    )

  const badge = (s: StatusValue) =>
    s === "loading" ? (
      <Badge variant="secondary">Проверка…</Badge>
    ) : s === "online" ? (
      <Badge className="bg-green-600">Работает</Badge>
    ) : (
      <Badge variant="destructive">Ошибка</Badge>
    )

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Wifi className="w-5 h-5" />
          <h3 className="font-semibold">Статус системы</h3>
        </div>

        <div className="space-y-3">
          {/* Парсер */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {icon(status.parser)}
              <span className="text-sm">API&nbsp;Парсера</span>
            </div>
            {badge(status.parser)}
          </div>

          {/* Каталог */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {icon(status.catalog)}
              <span className="text-sm">API&nbsp;Каталога</span>
            </div>
            {badge(status.catalog)}
          </div>

          {/* База данных */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {icon(status.database)}
              <Database className="w-4 h-4" />
              <span className="text-sm">База&nbsp;данных</span>
            </div>
            {badge(status.database)}
          </div>
        </div>

        {lastChecked && (
          <div className="mt-4 pt-3 border-t text-xs text-muted-foreground">Последняя проверка: {lastChecked}</div>
        )}
      </CardContent>
    </Card>
  )
}

/* Экспорт по умолчанию — на случай `import ApiStatus from ...` */
export default ApiStatus
