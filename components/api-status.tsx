"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, Database, Wifi } from "lucide-react"

interface ApiStatus {
  catalog: "loading" | "success" | "error"
  database: "loading" | "success" | "error"
}

export function ApiStatus() {
  const [status, setStatus] = useState<ApiStatus>({
    catalog: "loading",
    database: "loading",
  })

  useEffect(() => {
    checkApiStatus()
  }, [])

  async function checkApiStatus() {
    // Проверяем API каталога - делаем запрос к /api/catalog с лимитом 1 записи
    try {
      const catalogResponse = await fetch("/api/catalog?limit=1")
      setStatus((prev) => ({
        ...prev,
        catalog: catalogResponse.ok ? "success" : "error",
      }))
    } catch {
      setStatus((prev) => ({ ...prev, catalog: "error" }))
    }

    // Проверяем подключение к базе данных - делаем запрос к /api/test
    try {
      const dbResponse = await fetch("/api/test")
      setStatus((prev) => ({
        ...prev,
        database: dbResponse.ok ? "success" : "error",
      }))
    } catch {
      setStatus((prev) => ({ ...prev, database: "error" }))
    }
  }

  const getStatusIcon = (status: "loading" | "success" | "error") => {
    switch (status) {
      case "loading":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />
    }
  }

  const getStatusBadge = (status: "loading" | "success" | "error") => {
    switch (status) {
      case "loading":
        return <Badge variant="secondary">Проверка...</Badge>
      case "success":
        return (
          <Badge variant="default" className="bg-green-500">
            Работает
          </Badge>
        )
      case "error":
        return <Badge variant="destructive">Ошибка</Badge>
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Wifi className="w-5 h-5" />
          <h3 className="font-semibold">Статус системы</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(status.catalog)}
              <span className="text-sm">API Каталога</span>
            </div>
            {getStatusBadge(status.catalog)}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(status.database)}
              <Database className="w-4 h-4" />
              <span className="text-sm">База данных</span>
            </div>
            {getStatusBadge(status.database)}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t text-xs text-muted-foreground">
          Последняя проверка: {new Date().toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  )
}
