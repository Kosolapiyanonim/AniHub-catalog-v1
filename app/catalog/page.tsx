// Замените содержимое файла: /app/catalog/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnimeCard } from '@/components/anime-card';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDebounce } from '@/hooks/use-debounce';
import { Search } from 'lucide-react';

// Определяем типы данных
interface Anime {
  id: number;
  kodik_id: string;
  shikimori_id: string;
  title: string;
  poster_url?: string;
  year?: number;
}

interface Filters {
  page: number;
  limit: number;
  sort: string;
  order: string;
  genres: string[];
  year: string;
  status: string[];
  title: string;
}

export default function CatalogPage() {
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Состояние для всех фильтров
  const [filters, setFilters] = useState<Filters>({
    page: 1,
    limit: 24,
    sort: 'shikimori_rating',
    order: 'desc',
    genres: [],
    year: 'all',
    status: [],
    title: '',
  });

  const [genresList, setGenresList] = useState<string[]>([]);
  const [yearsList, setYearsList] = useState<number[]>([]);
  const debouncedSearchTerm = useDebounce(filters.title, 500);

  // Загрузка списков для фильтров (жанры, года)
  useEffect(() => {
    fetch('/api/genres').then(res => res.json()).then(data => setGenresList(data.genres || []));
    fetch('/api/years').then(res => res.json()).then(data => setYearsList(data.years || []));
  }, []);

  // Основная функция для загрузки данных
  const fetchCatalogData = useCallback(async (currentFilters: Filters, isNewFilter = false) => {
    if (isNewFilter) {
      setLoading(true);
      setAnimes([]); // Очищаем список при новом фильтре
    } else {
      setLoadingMore(true);
    }
    setError(null);

    const params = new URLSearchParams({
      page: currentFilters.page.toString(),
      limit: currentFilters.limit.toString(),
      sort: currentFilters.sort,
      order: currentFilters.order,
    });
    if (currentFilters.title) params.append('title', currentFilters.title);
    if (currentFilters.year !== 'all') params.append('year', currentFilters.year);
    if (currentFilters.genres.length > 0) params.append('genres', currentFilters.genres.join(','));

    try {
      const response = await fetch(`/api/catalog?${params.toString()}`);
      if (!response.ok) throw new Error(`Ошибка сети: ${response.statusText}`);
      
      const data = await response.json();
      setAnimes(prev => isNewFilter ? data.results : [...prev, ...data.results]);
      setHasMore(data.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неизвестная ошибка");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Эффект для перезагрузки данных при изменении фильтров
  useEffect(() => {
    // Создаем новый объект фильтров для сброса пагинации
    const newFilters = { ...filters, page: 1, title: debouncedSearchTerm };
    fetchCatalogData(newFilters, true);
  }, [debouncedSearchTerm, filters.sort, filters.order, filters.genres, filters.year, fetchCatalogData]);


  const loadMore = () => {
    if (!loadingMore && hasMore) {
      const newFilters = { ...filters, page: filters.page + 1 };
      setFilters(newFilters);
      fetchCatalogData(newFilters, false);
    }
  };

  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <h1 className="text-3xl font-bold mb-8">Каталог аниме</h1>
      
      {/* Панель фильтров */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 p-4 bg-slate-800 rounded-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Поиск по названию..." 
            className="pl-10"
            value={filters.title}
            onChange={e => handleFilterChange('title', e.target.value)}
          />
        </div>
        <Select value={filters.year} onValueChange={value => handleFilterChange('year', value)}>
          <SelectTrigger><SelectValue placeholder="Год" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все года</SelectItem>
            {yearsList.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filters.sort} onValueChange={value => handleFilterChange('sort', value)}>
          <SelectTrigger><SelectValue placeholder="Сортировка" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="shikimori_rating">По рейтингу</SelectItem>
            <SelectItem value="shikimori_votes">По популярности</SelectItem>
            <SelectItem value="year">По году</SelectItem>
          </SelectContent>
        </Select>
        {/* Фильтр по жанрам можно сделать более сложным, например, с мультиселектом */}
      </div>

      {loading && animes.length === 0 ? (
        <div className="flex justify-center items-center h-64"><LoadingSpinner size="lg" /></div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : animes.length === 0 ? (
        <p className="text-center text-muted-foreground">По вашему запросу ничего не найдено.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {animes.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
          {hasMore && (
            <div className="text-center mt-8">
              <Button onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? <LoadingSpinner /> : 'Загрузить еще'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
