"use client"

import { useState, useEffect } from "react"

interface StatusType {
  parser: "online" | "offline" | null
  catalog: "online" | "offline" | null
  database: "online" | "offline" | null
}

const ApiStatus = () => {
  const [status, setStatus] = useState<StatusType>({
    parser: null,
    catalog: null,
    database: null,
  })

  const checkApiStatus = async () => {
    try {
      // Проверка парсера
      const parserResponse = await fetch("/api/parser")

      // Проверка каталога
      const catalogResponse = await fetch("/api/catalog")

      // Проверка базы данных
      const databaseResponse = await fetch("/api/anime/database")

      // Обновление состояния
      setStatus({
        parser: parserResponse.ok ? "online" : "offline",
        catalog: catalogResponse.ok ? "online" : "offline",
        database: databaseResponse.ok ? "online" : "offline",
      })
    } catch (error) {
      console.error("Error checking API status:", error)
      setStatus({
        parser: "offline",
        catalog: "offline",
        database: "offline",
      })
    }
  }

  useEffect(() => {
    checkApiStatus()
    const intervalId = setInterval(checkApiStatus, 30000) // Обновление каждые 30 секунд

    return () => clearInterval(intervalId) // Очистка интервала при размонтировании компонента
  }, [])

  return (
    <div>
      <p>Parser API: {status.parser ? status.parser : "checking..."}</p>
      <p>Catalog API: {status.catalog ? status.catalog : "checking..."}</p>
      <p>Database: {status.database ? status.database : "checking..."}</p>
    </div>
  )
}

export default ApiStatus
