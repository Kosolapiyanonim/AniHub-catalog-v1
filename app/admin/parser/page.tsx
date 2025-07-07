// Замените содержимое файла: /app/admin/parser/page.tsx
"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Pause, ChevronsRight, RefreshCw } from "lucide-react";

export default function ParserAdminPage() {
  const [logs, setLogs] = useState<string[]>(["Панель управления парсером готова."]);
  const [isRunning, setIsRunning] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false); // Состояние для одиночных операций
  const isCancelled = useRef(false);

  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [stats, setStats] = useState({ processed: 0, errors: 0 });

  const addLog = (message: string) => {
    setLogs(prev => [...prev.slice(-100), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Функция для парсинга одной страницы
  const parseOnePage = async (url: string | null) => {
    const currentPageCounter = pageCount + 1;
    addLog(`🌀 Запрос страницы ${currentPageCounter}...`);
    try {
      const response = await fetch('/api/parse-single-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nextPageUrl: url }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || `HTTP ${response.status}`);
      
      addLog(`✅ ${result.message}`);
      setStats(prev => ({ ...prev, processed: prev.processed + result.processed }));
      setNextPageUrl(result.nextPageUrl);
      setPageCount(currentPageCounter);
      return result.nextPageUrl;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Неизвестная ошибка";
      addLog(`❌ Ошибка на странице ${currentPageCounter}: ${message}`);
      setStats(prev => ({ ...prev, errors: prev.errors + 1 }));
      throw error; // Пробрасываем ошибку, чтобы остановить цикл
    }
  };

  // Запускает полный цикл парсинга
  const startFullParsing = async () => {
    setIsRunning(true);
    isCancelled.current = false;
    addLog("🚀 Запуск полного парсинга...");
    let currentUrl = nextPageUrl;
    
    while (!isCancelled.current) {
      try {
        const nextUrl = await parseOnePage(currentUrl);
        currentUrl = nextUrl;
        if (currentUrl) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          addLog("🏁 Достигнут конец списка. Полный парсинг завершен.");
          break;
        }
      } catch (error) {
        addLog("🛑 Полный парсинг остановлен из-за ошибки.");
        break;
      }
    }
    if (isCancelled.current) addLog("⏸️ Полный парсинг приостановлен пользователем.");
    setIsRunning(false);
  };
  
  // Парсит только одну следующую страницу
  const handleParseNextPage = async () => {
      if (isRunning || isUpdating) return;
      setIsUpdating(true);
      try {
          await parseOnePage(nextPageUrl);
      } catch (error) {
          // Ошибка уже залогирована в parseOnePage
      }
      setIsUpdating(false);
  };

  // Парсит последние обновления
  const handleParseLatest = async () => {
      if (isRunning || isUpdating) return;
      setIsUpdating(true);
      addLog("🔄 Запрос последних обновлений...");
      try {
          const response = await fetch('/api/parse-latest', { method: 'POST' });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || `HTTP ${response.status}`);
          addLog(`✅ ${result.message}`);
          setStats(prev => ({ ...prev, processed: prev.processed + result.processed }));
      } catch (error) {
          const message = error instanceof Error ? error.message : "Неизвестная ошибка";
          addLog(`❌ Ошибка при запросе обновлений: ${message}`);
          setStats(prev => ({ ...prev, errors: prev.errors + 1 }));
      }
      setIsUpdating(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <Card>
        <CardHeader>
          <CardTitle>Панель управления парсером</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                  <h3 className="font-semibold">Полная синхронизация</h3>
                  <div className="flex gap-2">
                      <Button onClick={startFullParsing} disabled={isRunning || isUpdating}>
                          <Play className="mr-2 h-4 w-4" />
                          {pageCount > 0 ? 'Продолжить' : 'Начать'}
                      </Button>
                      <Button onClick={() => { isCancelled.current = true; setIsRunning(false); }} disabled={!isRunning} variant="outline">
                          <Pause className="mr-2 h-4 w-4" />
                          Пауза
                      </Button>
                  </div>
              </div>
              <div className="space-y-2">
                  <h3 className="font-semibold">Ручное управление</h3>
                  <div className="flex gap-2">
                      <Button onClick={handleParseNextPage} disabled={isRunning || isUpdating || !nextPageUrl} variant="secondary">
                          <ChevronsRight className="mr-2 h-4 w-4" />
                          След. страница
                      </Button>
                      <Button onClick={handleParseLatest} disabled={isRunning || isUpdating} variant="secondary">
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Обновить
                      </Button>
                  </div>
              </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4 text-center">
            <div className="p-4 bg-slate-100 rounded-lg dark:bg-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">Обработано страниц</p>
              <p className="text-2xl font-bold">{pageCount}</p>
            </div>
            <div className="p-4 bg-green-100 rounded-lg dark:bg-green-900/50">
              <p className="text-sm text-green-600 dark:text-green-400">Сохранено записей</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.processed}</p>
            </div>
            <div className="p-4 bg-red-100 rounded-lg dark:bg-red-900/50">
              <p className="text-sm text-red-600 dark:text-red-400">Ошибки</p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.errors}</p>
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
