// /app/test/page.tsx (или на новой странице)

// ...
  const runFullParser = async () => {
    setLoading(true);
    setOutput("🚀 Запуск ПОЛНОЙ синхронизации. Это может занять много времени...\n");
    
    const response = await fetch("/api/full-parser", { method: "POST" });
    const data = await response.json();
    
    setOutput(data.output || "Нет вывода от парсера.");
    setLoading(false);
  };
// ...
