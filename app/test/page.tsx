// /app/test/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Terminal, Play } from "lucide-react";

export default function TestParserPage() {
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<string>("");
  const [pagesToParse, setPagesToParse] = useState(1); // Состояние для кол-ва страниц

  const runParser = async () => {
    setLoading(true);
    setOutput(`🚀 Запуск парсера на ${pagesToParse} страниц...\n`);

    try {
      const response = await fetch("/api/parser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pagesToParse: pagesToParse }),
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Произошла неизвестная ошибка");
      }

      setOutput(data.output || "Парсер выполнен, но не вернул вывода.");

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Неизвестная ошибка";
      setOutput((prev) => prev + `\n❌ КРИТИЧЕСКАЯ ОШИБКА: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <h1 className="text-3xl font-bold mb-6">⚙️ Панель управления парсером</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Запуск парсинга
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-2">
                <Input
                type="number"
                value={pagesToParse}
                onChange={(e) => setPagesToParse(Math.max(1, parseInt(e.target.value) || 1))}
                className="max-w-[120px]"
                />
                <label className="text-sm text-muted-foreground">страниц</label>
            </div>
            <Button onClick={runParser} disabled={loading} size="lg" className="w-full sm:w-auto">
              {loading ? <LoadingSpinner size="sm" className="mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              Запустить парсер
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Парсер будет обрабатывать по 100 записей на страницу и пропускать уже существующие аниме.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-black text-white">
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Логи выполнения
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <pre className="bg-black text-green-400 p-4 rounded-b-lg overflow-auto h-[600px] font-mono text-sm">
            {output || "Ожидание запуска..."}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
