"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { CircleCheck, CircleX } from "lucide-react"

export function ApiStatus() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await fetch("/api/test")
        if (response.ok) {
          setStatus("success")
        } else {
          setStatus("error")
        }
      } catch (error) {
        setStatus("error")
      }
    }

    checkApiStatus()
    const interval = setInterval(checkApiStatus, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [])

  return (
    <Badge variant={status === "success" ? "default" : "destructive"} className="flex items-center gap-1">
      {status === "success" ? <CircleCheck className="h-3 w-3" /> : <CircleX className="h-3 w-3" />}
      API: {status === "success" ? "Online" : "Offline"}
    </Badge>
  )
}
