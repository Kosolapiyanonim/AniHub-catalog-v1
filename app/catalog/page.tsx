// /app/catalog/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { AnimeCard } from '@/components/anime-card';
import { LoadingSpinner } from '@/components/loading-spinner';

interface Anime {
  id: number;
  shikimori_id: string;
  title: string;
  poster_url?: string;
  year?: number;
}

export default function CatalogPage() {
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Эта функция будет вызвана только один раз при загрузке страницы
    const fetchCatalogData = async () => {
      setLoading(true);
      setError(null);
      console.log("[FRONTEND] 🚀 Начинаем загрузку каталога...");
      
      try {
        const response = await fetch('/api/catalog?limit=24'); // Загружаем первые 24
        console.log("[FRONTEND] ⬅️ Получен ответ от API, статус:", response.status);

        if (!response.ok) {
          throw new Error(`Ошибка сети: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("[FRONTEND] 📄 Данные после парсинга JSON:", data);

        if (!data.results) {
            throw new Error("API не вернул поле 'results'");
        }

        setAnimes(data.results);
        console.log("[FRONTEND] ✅ Состояние 'animes' обновлено, в нем теперь", data.results.length, "элементов.");

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Неизвестная ошибка";
        console.error("[FRONTEND] ❌ Ошибка:", errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
        console.log("[FRONTEND] 🏁 Загрузка завершена.");
      }
    };

    fetchCatalogData();
  }, []); // Пустой массив зависимостей означает "выполнить один раз"

  // --- Логика отрисовки ---

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner size="lg" /></div>;
  }

  if (error) {
    return <div className="text-center text-red-500 pt-32">Ошибка: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <h1 className="text-3xl font-bold text-white mb-8">Каталог аниме ({animes.length})</h1>
      
      {animes.length === 0 ? (
        <p className="text-white text-center">Аниме не найдено.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {animes.map((animeItem) => (
            <AnimeCard key={animeItem.id} anime={animeItem} />
          ))}
        </div>
      )}
    </div>
  );
}
