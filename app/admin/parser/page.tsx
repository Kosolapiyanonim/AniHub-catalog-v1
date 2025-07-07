// Создайте папку и файл: /app/admin/parser/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, XCircle, Loader, Play, Pause } from "lucide-react";

export default function ParserAdminPage() {
  const [logs, setLogs] = useState<string[]>(["Панель управления парсером готова."]);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState({ processed: 0, errors: 0 });

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const startParsing = async () => {
    setIsRunning(true);
    setIsPaused(false);
    addLog("🚀 Запуск полного парсинга...");

    let page = currentPage;
    let shouldContinue = true;

    while (shouldContinue && !isPaused) {
      try {
        addLog(`🌀 Запрос страницы ${page}...`);
        const response = await fetch('/api/parse-single-page', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ page }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || `HTTP ${response.status}`);
        }

        addLog(`✅ ${result.message}`);
        setStats(prev => ({ ...prev, processed: prev.processed + result.processed }));

        if (result.hasNextPage) {
          page++;
          setCurrentPage(page);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Пауза 1 сек
        } else {
          shouldContinue = false;
          addLog("🏁 Достигнут конец списка. Парсинг завершен.");
          setIsRunning(false);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Неизвестная ошибка";
        addLog(`❌ Ошибка на странице ${page}: ${message}`);
        setStats(prev => ({ ...prev, errors: prev.errors + 1 }));
        // Можно добавить логику паузы при ошибке
        shouldContinue = false;
        setIsRunning(false);
      }
    }
    if (isPaused) {
        addLog("⏸️ Парсинг приостановлен.");
    }
  };

  const handleStart = () => {
    if (!isRunning) {
      startParsing();
    }
  };

  const handlePause = () => {
    setIsPaused(true);
    setIsRunning(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <Card>
        <CardHeader>
          <CardTitle>Панель управления парсером Kodik</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Button onClick={handleStart} disabled={isRunning}>
              <Play className="mr-2 h-4 w-4" />
              {isPaused || currentPage > 1 ? 'Продолжить' : 'Начать полный парсинг'}
            </Button>
            <Button onClick={handlePause} disabled={!isRunning} variant="outline">
              <Pause className="mr-2 h-4 w-4" />
              Пауза
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4 text-center">
            <div className="p-4 bg-slate-100 rounded-lg">
              <p className="text-sm text-slate-500">Текущая страница</p>
              <p className="text-2xl font-bold">{currentPage}</p>
            </div>
            <div className="p-4 bg-green-100 rounded-lg">
              <p className="text-sm text-green-600">Обработано</p>
              <p className="text-2xl font-bold text-green-700">{stats.processed}</p>
            </div>
            <div className="p-4 bg-red-100 rounded-lg">
              <p className="text-sm text-red-600">Ошибки</p>
              <p className="text-2xl font-bold text-red-700">{stats.errors}</p>
            </div>
          </div>
          <p className="text-sm text-slate-500 mb-2">Лог выполнения:</p>
          <ScrollArea className="h-72 w-full rounded-md border p-4 font-mono text-sm">
            {logs.map((log, i) => (
              <p key={i}>{log}</p>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
