"use client"

import { useState, useEffect } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export function ApiStatus() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("Проверка статуса API...")

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await fetch("/api/test")
        const data = await response.json()
        if (response.ok && data.status === "ok") {
          setStatus("success")
          setMessage("API работает корректно.")
        } else {
          setStatus("error")
          setMessage(`Ошибка API: ${data.message || "Неизвестная ошибка"}`)
        }
      } catch (error) {
        setStatus("error")
        setMessage(`Ошибка подключения: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    checkApiStatus()
    const interval = setInterval(checkApiStatus, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [])

  const Icon = status === "loading" ? Loader2 : status === "success" ? CheckCircle : XCircle
  const colorClass =
    status === "loading" ? "text-gray-500 animate-spin" : status === "success" ? "text-green-500" : "text-red-500"

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 cursor-pointer">
            <Icon className={`h-5 w-5 ${colorClass}`} />
            <span className="sr-only">Статус API</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{message}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
