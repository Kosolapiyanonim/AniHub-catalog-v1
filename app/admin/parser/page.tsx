// Рекомендуемый путь: /app/admin/parser/page.tsx

"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, Square, RefreshCw } from "lucide-react";

// Тип для логов, чтобы они были цветными
type LogEntry = {
  type: "info" | "success" | "error";
  message: string;
};

// Основной компонент страницы
export default function ParserControlPage() {
  const [isParsing, setIsParsing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Используем useRef для хранения URL следующей страницы и статуса парсинга,
  // чтобы избежать лишних перерисовок компонента.
  const nextPageUrlRef = useRef<string | null>(null);
  const isParsingRef = useRef(false);

  // Функция для добавления записей в лог
  const addLog = useCallback((message: string, type: LogEntry['type'] = "info") => {
    setLogs(prev => [...prev, { type, message: `[${new Date().toLocaleTimeString()}] ${message}` }]);
  }, []);

  // Главная функция управления парсингом
  const runParsingProcess = useCallback(async () => {
    // Если уже не парсим (нажали "Стоп"), выходим из цикла
    if (!isParsingRef.current) {
        setIsParsing(false);
        setIsPaused(false);
        addLog("Парсинг остановлен пользователем.", "error");
        return;
    }
    
    // Если парсинг на паузе
    if (isPaused) {
        addLog("Парсинг на паузе.", "info");
        return;
    }

    addLog(`Отправка запроса для: ${nextPageUrlRef.current || "начальной страницы"}...`);

    try {
      const response = await fetch("/api/parse-single-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nextPageUrl: nextPageUrlRef.current }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Ошибка сервера: ${response.status}`);
      }
      
      addLog(`Успешно обработано: ${result.processed || 0} записей. ${result.message}`, "success");
      
      // Обновляем прогресс (для примера, можно сделать более сложную логику)
      setProgress(prev => Math.min(prev + 5, 100)); 

      // Если сервер прислал URL следующей страницы
      if (result.nextPageUrl) {
        nextPageUrlRef.current = result.nextPageUrl;
        // Рекурсивно вызываем себя для следующего шага
        setTimeout(runParsingProcess, 1000); // Небольшая задержка между запросами
      } else {
        // Если URL нет, значит парсинг завершен
        addLog("Парсинг успешно завершен. Больше страниц нет.", "success");
        setProgress(100);
        isParsingRef.current = false;
        setIsParsing(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Неизвестная ошибка";
      setError(errorMessage);
      addLog(`Критическая ошибка: ${errorMessage}`, "error");
      isParsingRef.current = false;
      setIsParsing(false);
    }
  }, [addLog, isPaused]);

  // Обработчики кнопок
  const handleStart = () => {
    setLogs([]);
    setError(null);
    setProgress(0);
    setIsPaused(false);
    setIsParsing(true);
    isParsingRef.current = true;
    nextPageUrlRef.current = null; // Начинаем с самого начала
    addLog("Запуск парсинга...");
    runParsingProcess();
  };
  
  const handlePause = () => {
      setIsPaused(true);
  };

  const handleResume = () => {
      setIsPaused(false);
      addLog("Возобновление парсинга...");
      // Запускаем процесс снова, он подхватит текущий nextPageUrl
      runParsingProcess();
  };

  const handleStop = () => {
    isParsingRef.current = false; // Устанавливаем флаг остановки
    // Состояние isParsing обновится в самом цикле runParsingProcess
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-24 min-h-screen">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            <RefreshCw className="text-blue-500"/>
            Панель управления парсером
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 mb-6">
            {!isParsing ? (
              <Button onClick={handleStart} className="bg-blue-600 hover:bg-blue-700">
                <Play className="mr-2 h-4 w-4" /> Начать парсинг
              </Button>
            ) : (
                <>
                    {isPaused ? (
                         <Button onClick={handleResume} className="bg-green-600 hover:bg-green-700">
                            <Play className="mr-2 h-4 w-4" /> Продолжить
                        </Button>
                    ) : (
                        <Button onClick={handlePause} variant="outline">
                            <Pause className="mr-2 h-4 w-4" /> Пауза
                        </Button>
                    )}
                    <Button onClick={handleStop} variant="destructive">
                        <Square className="mr-2 h-4 w-4" /> Стоп
                    </Button>
                </>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Прогресс:</label>
              <Progress value={progress} className="w-full mt-1" />
            </div>
            
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-bold text-red-800">Произошла ошибка:</p>
                    <p className="text-sm text-red-700 font-mono mt-1">{error}</p>
                </div>
            )}

            <div>
              <label className="text-sm font-medium">Логи выполнения:</label>
              <div className="bg-gray-900 text-white font-mono text-xs rounded-lg p-4 mt-1 h-80 overflow-y-auto">
                {logs.map((log, index) => (
                  <p key={index} className={
                    log.type === 'error' ? 'text-red-400' : 
                    log.type === 'success' ? 'text-green-400' : 'text-gray-300'
                  }>
                    {log.message}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
