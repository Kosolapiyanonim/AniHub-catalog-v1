"use client"

import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { ParserControl } from "@/components/parser-control"
import { ApiStatus } from "@/components/api-status"

export default function AdminParserPage() {
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ParserControl
          url={url}
          setUrl={setUrl}
          output={output}
          setOutput={setOutput}
          loading={loading}
          setLoading={setLoading}
          parserType={parserType}
          setParserType={setParserType}
          parseLatestCount={parseLatestCount}
          setParseLatestCount={setParseLatestCount}
          parseLatestOffset={parseLatestOffset}
          setParseLatestOffset={setParseLatestOffset}
          parseLatestForce={parseLatestForce}
          setParseLatestForce={setParseLatestForce}
          handleParseSinglePage={handleParseSinglePage}
          handleParseLatest={handleParseLatest}
          handleFullParse={handleFullParse}
        />
        <ApiStatus />
      </div>
    </div>
  )
}
