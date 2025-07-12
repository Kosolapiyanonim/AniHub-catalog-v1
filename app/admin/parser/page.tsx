// /app/admin/parser/page.tsx
"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Play, Square } from "lucide-react";
import { toast } from "sonner";

type LogEntry = {
  type: "info" | "success" | "error" | "warn";
  message: string;
};

export default function ParserAdminPage() {
  const [isParsing, setIsParsing] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  const nextPageUrlRef = useRef<string | null>(null);
  const isRunningRef = useRef(false);

  const addLog = useCallback((message: string, type: LogEntry['type'] = "info") => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev.slice(0, 100)]);
  }, []);

  const runParseStep = useCallback(async () => {
    if (!isRunningRef.current) {
      addLog("Парсинг остановлен пользователем.", "warn");
      setIsParsing(false);
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
        setTimeout(runParseStep, 1500); // Задержка 1.5 секунды между запросами
      } else {
        addLog("Полная синхронизация завершена. Больше страниц нет.", "success");
        toast.success("Полный парсинг успешно завершен!");
        isRunningRef.current = false;
        setIsParsing(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Неизвестная ошибка";
      addLog(`Критическая ошибка: ${errorMessage}`, "error");
      toast.error(`Ошибка парсинга: ${errorMessage}`);
      isRunningRef.current = false;
      setIsParsing(false);
    }
  }, [addLog]);

  const handleStart = () => {
    setLogs([]);
    setIsParsing(true);
    isRunningRef.current = true;
    nextPageUrlRef.current = null;
    addLog("Запуск полной синхронизации...");
    toast.info("Начат полный парсинг. Это может занять много времени.");
    runParseStep();
  };

  const handleStop = () => {
    isRunningRef.current = false;
  };
  
  return (
    <div className="container mx-auto px-4 py-8 pt-24 min-h-screen">
      <Card>
        <CardHeader>
          <CardTitle>Панель управления парсером</CardTitle>
          <CardDescription>Запускает полный пошаговый парсинг всех аниме из Kodik. Используйте это для первоначального наполнения или полной перепроверки базы.</CardDescription>
        </CardHeader>
        <CardContent>
          {!isParsing ? (
              <Button onClick={handleStart} className="bg-blue-600 hover:bg-blue-700">
                  <Play className="mr-2 h-4 w-4" /> Начать полную синхронизацию
              </Button>
          ) : (
              <Button onClick={handleStop} variant="destructive">
                  <Square className="mr-2 h-4 w-4" /> Остановить
              </Button>
          )}
        </CardContent>
      </Card>

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
