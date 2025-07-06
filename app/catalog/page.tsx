// /app/catalog/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimeCard } from "@/components/anime-card";
// ... другие импорты ...

export default function CatalogPage() {
  const [animes, setAnimes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ sort: 'shikimori_rating', genres: 'all' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        sort: filters.sort,
        genres: filters.genres,
      });
      const res = await fetch(`/api/catalog?${params.toString()}`);
      const data = await res.json();
      setAnimes(data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // UI для фильтров будет менять состояние `filters`, что вызовет `useEffect`
  // ...

  return (
    <div>
      {/* Ваши фильтры */}
      <div className="grid ...">
        {animes.map((anime) => (
          <AnimeCard anime={anime} />
        ))}
      </div>
    </div>
  );
}
