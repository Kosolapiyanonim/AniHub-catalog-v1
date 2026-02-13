"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { RefreshCw, Bug, PlayCircle, Search } from "lucide-react";

type PeriodKey = "24h" | "7d" | "30d" | "180d";
type AnimeIdType = "shikimori" | "internal";

type AnimeChange = {
  shikimori_id: string;
  title: string;
  action: "inserted" | "updated" | "unchanged";
  changedFields: string[];
};

type ParserResponse = {
  error?: string;
  threshold?: string;
  pagesScanned?: number;
  totalFetched?: number;
  processed?: number;
  inserted?: number;
  updated?: number;
  unchanged?: number;
  uniqueCandidates?: number;
  targetShikimoriId?: string | null;
  animeChanges?: AnimeChange[];
  logs?: string[];
};

const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: "24h", label: "24 часа" },
  { key: "7d", label: "Неделя" },
  { key: "30d", label: "Месяц" },
  { key: "180d", label: "6 месяцев" },
];

export default function ParserControlPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ParserResponse | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [period, setPeriod] = useState<PeriodKey>("24h");
  const [animeId, setAnimeId] = useState("");
  const [animeIdType, setAnimeIdType] = useState<AnimeIdType>("shikimori");

  const addUiLog = (message: string) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev]);
  };

  const runParser = async (opts: { singleAnimeDebug?: boolean; byId?: boolean }) => {
    const { singleAnimeDebug = false, byId = false } = opts;
    if (byId && !animeId.trim()) {
      addUiLog("Введите anime id для точечного парсинга");
      return;
    }

    setIsLoading(true);
    setResult(null);

    addUiLog(
      `${singleAnimeDebug ? "Тест" : "Запуск"}: period=${period}${byId ? `, animeId=${animeId.trim()} (${animeIdType})` : ""}`,
    );

    try {
      const response = await fetch("/api/manual-parser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          period,
          singleAnimeDebug,
          animeId: byId ? animeId.trim() : undefined,
          animeIdType: byId ? animeIdType : undefined,
        }),
      });

      const data = (await response.json()) as ParserResponse;
      setResult(data);

      if (!response.ok) {
        addUiLog(`Ошибка: ${data.error || "Неизвестная"}`);
      } else {
        addUiLog(`Готово: processed=${data.processed ?? 0}, pages=${data.pagesScanned ?? 0}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Неизвестная ошибка";
      setResult({ error: message });
      addUiLog(`Критическая ошибка: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const progress = useMemo(() => {
    const processed = result?.processed ?? 0;
    const candidates = result?.uniqueCandidates ?? 0;
    if (!candidates) return 0;
    return Math.min(100, Math.round((processed / candidates) * 100));
  }, [result]);

  return (
    <div className="container mx-auto px-4 py-8 pt-24 min-h-screen">
      <Card className="max-w-5xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            <RefreshCw className="text-blue-500" />
            Панель ручного парсера Kodik
          </CardTitle>
          <CardDescription>Исходный компактный вид + новые возможности (периоды, ID, расширенные логи).</CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {PERIODS.map((item) => (
              <Button key={item.key} variant={period === item.key ? "default" : "outline"} onClick={() => setPeriod(item.key)} disabled={isLoading}>
                {item.label}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button disabled={isLoading} className="bg-blue-600 hover:bg-blue-700" onClick={() => runParser({})}>
              <PlayCircle className="mr-2 h-4 w-4" /> Запустить период
            </Button>
            <Button disabled={isLoading} variant="outline" className="border-amber-500/60 text-amber-300" onClick={() => runParser({ singleAnimeDebug: true })}>
              <Bug className="mr-2 h-4 w-4" /> Тест (1 аниме)
            </Button>
          </div>

          <Card className="border-dashed">
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Search className="h-4 w-4" /> Точечный парсинг по ID
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-2">
                <Input value={animeId} onChange={(e) => setAnimeId(e.target.value)} placeholder="anime id (shikimori или internal)" />
                <select
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={animeIdType}
                  onChange={(e) => setAnimeIdType(e.target.value as AnimeIdType)}
                >
                  <option value="shikimori">shikimori_id</option>
                  <option value="internal">internal id (animes.id)</option>
                </select>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700" onClick={() => runParser({ byId: true })}>
                  Спарсить по ID
                </Button>
                <Button disabled={isLoading} variant="outline" onClick={() => runParser({ byId: true, singleAnimeDebug: true })}>
                  Тест по ID
                </Button>
              </div>
            </CardContent>
          </Card>

          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span>Прогресс обработки кандидатов</span>
              <Badge variant="secondary">{progress}%</Badge>
            </div>
            <Progress value={progress} className="w-full" />
          </div>

          {result?.targetShikimoriId ? (
            <p className="text-xs text-muted-foreground">Целевой shikimori_id: <span className="font-mono">{result.targetShikimoriId}</span></p>
          ) : null}

          {result?.error ? <div className="p-3 rounded border border-red-400/50 bg-red-500/10 text-red-300 text-sm">{result.error}</div> : null}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>Обработано: <b>{result?.processed ?? 0}</b></div>
            <div>Кандидатов: <b>{result?.uniqueCandidates ?? 0}</b></div>
            <div>Новые: <b>{result?.inserted ?? 0}</b></div>
            <div>Обновлённые: <b>{result?.updated ?? 0}</b></div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Изменения в БД</p>
            <div className="bg-gray-900 text-gray-100 rounded-lg p-3 text-xs h-48 overflow-auto font-mono">
              {(result?.animeChanges || []).length === 0 ? (
                <p className="text-gray-400">Пока пусто.</p>
              ) : (
                (result?.animeChanges || []).map((change, index) => (
                  <p key={`${change.shikimori_id}-${index}`}>
                    {index + 1}. [{change.action.toUpperCase()}] {change.title} ({change.shikimori_id}) → {change.changedFields.join(", ") || "none"}
                  </p>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium mb-2">Логи API</p>
              <div className="bg-gray-900 text-gray-100 rounded-lg p-3 text-xs h-80 overflow-auto font-mono">
                {(result?.logs || []).length === 0 ? <p className="text-gray-400">Пока пусто.</p> : (result?.logs || []).map((line, idx) => <p key={`${line}-${idx}`}>{line}</p>)}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Логи UI</p>
              <div className="bg-gray-900 text-gray-100 rounded-lg p-3 text-xs h-80 overflow-auto font-mono">
                {logs.length === 0 ? <p className="text-gray-400">Пока пусто.</p> : logs.map((line, idx) => <p key={`${line}-${idx}`}>{line}</p>)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
