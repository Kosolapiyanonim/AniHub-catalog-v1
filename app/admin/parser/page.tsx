"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RefreshCw, Bug, PlayCircle, Clock3 } from "lucide-react";

type PeriodKey = "24h" | "7d" | "30d" | "180d";

type AnimeChange = {
  shikimori_id: string;
  title: string;
  action: "inserted" | "updated" | "unchanged";
  changedFields: string[];
};

type ParserResponse = {
  message?: string;
  error?: string;
  period?: PeriodKey;
  threshold?: string;
  pagesScanned?: number;
  totalFetched?: number;
  processed?: number;
  inserted?: number;
  updated?: number;
  unchanged?: number;
  uniqueCandidates?: number;
  skippedWithoutShikimori?: number;
  animeChanges?: AnimeChange[];
  logs?: string[];
};

const PERIODS: { key: PeriodKey; label: string; hint: string }[] = [
  { key: "24h", label: "Последние 24 часа", hint: "Вчера → сегодня" },
  { key: "7d", label: "Последняя неделя", hint: "7 дней" },
  { key: "30d", label: "Последний месяц", hint: "30 дней" },
  { key: "180d", label: "Последние 6 месяцев", hint: "180 дней" },
];

export default function ParserControlPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ParserResponse | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addUiLog = (message: string) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev]);
  };

  const runParser = async (period: PeriodKey, singleAnimeDebug = false) => {
    setIsLoading(true);
    setResult(null);
    addUiLog(
      `${singleAnimeDebug ? "Debug-режим" : "Полный ручной запуск"}: ${period}${singleAnimeDebug ? " (1 аниме)" : ""}`,
    );

    try {
      const response = await fetch("/api/manual-parser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ period, singleAnimeDebug }),
      });

      const data = (await response.json()) as ParserResponse;
      setResult(data);

      if (!response.ok) {
        addUiLog(`Ошибка: ${data.error || "Неизвестная ошибка"}`);
      } else {
        addUiLog(`Готово: обработано ${data.processed ?? 0}, страниц ${data.pagesScanned ?? 0}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Неизвестная ошибка";
      setResult({ error: message });
      addUiLog(`Критическая ошибка: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = useMemo(
    () => [
      { label: "Обработано", value: result?.processed ?? 0 },
      { label: "Кандидатов", value: result?.uniqueCandidates ?? 0 },
      { label: "Страниц", value: result?.pagesScanned ?? 0 },
      { label: "Скачано", value: result?.totalFetched ?? 0 },
      { label: "Новые", value: result?.inserted ?? 0 },
      { label: "Обновлённые", value: result?.updated ?? 0 },
      { label: "Без изменений", value: result?.unchanged ?? 0 },
    ],
    [result],
  );

  return (
    <div className="container mx-auto px-4 py-8 pt-24 min-h-screen">
      <Card className="max-w-6xl mx-auto border-white/10">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            <RefreshCw className="text-blue-500" />
            Ручной парсер Kodik
          </CardTitle>
          <CardDescription>
            Выберите период и запустите парсинг вручную. Доступны основной запуск и debug-кнопка (1 аниме).
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PERIODS.map((period) => (
              <Card key={period.key} className="border-white/10 bg-black/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>{period.label}</span>
                    <Badge variant="secondary" className="text-xs">
                      {period.key}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Clock3 className="h-4 w-4" /> {period.hint}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Button disabled={isLoading} onClick={() => runParser(period.key)} className="bg-blue-600 hover:bg-blue-700">
                    <PlayCircle className="mr-2 h-4 w-4" /> Запустить
                  </Button>
                  <Button
                    disabled={isLoading}
                    variant="outline"
                    onClick={() => runParser(period.key, true)}
                    className="border-amber-500/60 text-amber-300"
                  >
                    <Bug className="mr-2 h-4 w-4" /> Тест: 1 аниме
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator />

          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
            {stats.map((item) => (
              <Card key={item.label} className="border-white/10 bg-black/20">
                <CardContent className="py-4">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-2xl font-semibold">{item.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {result?.threshold && (
            <div className="text-sm text-muted-foreground">
              Порог по дате: <span className="font-mono">{result.threshold}</span>
            </div>
          )}

          {result?.error && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-red-300 text-sm">Ошибка: {result.error}</div>
          )}



          <div>
            <p className="text-sm font-medium mb-2">Изменения в БД (по аниме)</p>
            <div className="bg-gray-900 text-gray-100 rounded-lg p-3 text-xs h-72 overflow-auto font-mono">
              {(result?.animeChanges || []).length === 0 ? (
                <p className="text-gray-400">Пока пусто.</p>
              ) : (
                (result?.animeChanges || []).map((change, index) => (
                  <p key={`${change.shikimori_id}-${index}`}>
                    {index + 1}. [{change.action.toUpperCase()}] {change.title} ({change.shikimori_id}) fields: {change.changedFields.join(", ") || "none"}
                  </p>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium mb-2">Логи API</p>
              <div className="bg-gray-900 text-gray-100 rounded-lg p-3 text-xs h-72 overflow-auto font-mono">
                {(result?.logs || []).length === 0 ? (
                  <p className="text-gray-400">Пока пусто.</p>
                ) : (
                  (result?.logs || []).map((line, index) => <p key={`${line}-${index}`}>{line}</p>)
                )}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Логи UI</p>
              <div className="bg-gray-900 text-gray-100 rounded-lg p-3 text-xs h-72 overflow-auto font-mono">
                {logs.length === 0 ? (
                  <p className="text-gray-400">Пока пусто.</p>
                ) : (
                  logs.map((line, index) => <p key={`${line}-${index}`}>{line}</p>)
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
