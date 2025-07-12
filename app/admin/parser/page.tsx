// /app/admin/parser/page.tsx
"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, Square, RefreshCw, Zap } from "lucide-react";
import { toast } from "sonner";

type LogEntry = {
  type: "info" | "success" | "error" | "warn";
  message: string;
};

export default function ParserControlPage() {
  const [isFullParsing, setIsFullParsing] = useState(false);
  const [isLatestParsing, setIsLatestParsing] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  const nextPageUrlRef = useRef<string | null>(null);
  const isRunningRef = useRef(false);

  const addLog = useCallback((message: string, type: LogEntry['type'] = "info") => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev.slice(0, 100)]);
  }, []);

  const runFullParseStep = useCallback(async () => {
    if (!isRunningRef.current) {
      addLog("Полная синхронизация остановлена.", "warn");
      setIsFullParsing(false);
      return;
    }
    
    addLog(`Запрос для: ${nextPageUrlRef.current || "начальной страницы"}...`);

    try {
      const response = await fetch("/api/parse-single-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nextPageUrl: nextPageUrlRef.current }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || `Ошибка сервера: ${response.status}`);
      
      addLog(result.message, "success");
      
      if (result.nextPageUrl) {
        nextPageUrlRef.current = result.nextPageUrl;
        setTimeout(runFullParseStep, 1500); // Задержка между запросами
      } else {
        addLog("Полная синхронизация завершена. Больше страниц нет.", "success");
        isRunningRef.current = false;
        setIsFullParsing(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Неизвестная ошибка";
      addLog(`Критическая ошибка: ${errorMessage}`, "error");
      toast.error(`Ошибка парсинга: ${errorMessage}`);
      isRunningRef.current = false;
      setIsFullParsing(false);
    }
  }, [addLog]);

  const handleStartFull = () => {
    setLogs([]);
    setIsFullParsing(true);
    isRunningRef.current = true;
    nextPageUrlRef.current = null; 
    addLog("Запуск полной синхронизации...");
    runFullParseStep();
  };

  const handleStopFull = () => {
    isRunningRef.current = false;
  };
  
  const handleParseLatest = async () => {
    setIsLatestParsing(true);
    addLog("Запуск быстрого обновления...");
    toast.info("Запущен процесс обновления последних аниме.");
    try {
        const response = await fetch('/api/parse-latest', { method: 'POST' });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        addLog(result.message, 'success');
        toast.success(result.message);
    } catch (err) {
        const message = err instanceof Error ? err.message : "Неизвестная ошибка";
        addLog(message, 'error');
        toast.error(message);
    } finally {
        setIsLatestParsing(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-24 min-h-screen">
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3"><RefreshCw className="text-blue-500"/>Полная синхронизация</CardTitle>
            <CardDescription>Запускает полный пошаговый парсинг всех аниме из Kodik. Используйте это для первоначального наполнения или полной перепроверки базы.</CardDescription>
          </CardHeader>
          <CardContent>
            {!isFullParsing ? (
                <Button onClick={handleStartFull} className="bg-blue-600 hover:bg-blue-700">
                    <Play className="mr-2 h-4 w-4" /> Начать полную синхронизацию
                </Button>
            ) : (
                <Button onClick={handleStopFull} variant="destructive">
                    <Square className="mr-2 h-4 w-4" /> Остановить
                </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3"><Zap className="text-yellow-500"/>Быстрое обновление</CardTitle>
            <CardDescription>Сканирует последние 100 обновленных на Kodik аниме. Идеально для ежедневного поддержания актуальности.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleParseLatest} disabled={isLatestParsing || isFullParsing}>
                {isLatestParsing ? "Обновление..." : "Запустить быстрое обновление"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
            <CardTitle>Логи выполнения</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="bg-gray-900 text-white font-mono text-xs rounded-lg p-4 h-96 overflow-y-auto">
              {logs.map((log, index) => (
                <p key={index} className={
                  log.type === 'error' ? 'text-red-400' : 
                  log.type === 'success' ? 'text-green-400' : 
                  log.type === 'warn' ? 'text-yellow-400' : 'text-gray-300'
                }>
                  {log.message}
                </p>
              ))}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
