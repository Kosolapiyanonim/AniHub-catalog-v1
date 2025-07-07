// Замените содержимое файла: /app/catalog/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnimeCard } from '@/components/anime-card';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useDebounce } from '@/hooks/use-debounce';
import { Search, X, ChevronDown } from 'lucide-react';

// --- Типы и константы для фильтров ---
interface Anime {
  id: number;
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
  studios: string[];
  year: string;
  status: string;
  type: string;
  episodes: string;
  title: string;
}

const STATUS_OPTIONS = { 'all': 'Все статусы', 'ongoing': 'Онгоинг', 'released': 'Вышел', 'anons': 'Анонс' };
const TYPE_OPTIONS = { 'all': 'Все типы', 'anime': 'Фильм', 'anime-serial': 'ТВ-сериал', 'OVA': 'OVA', 'ONA': 'ONA' };
const EPISODE_OPTIONS = { 'all': 'Все серии', 'short': 'Короткие (1-6)', 'standard': 'Стандарт (7-26)', 'long': 'Длинные (27+)' };

// --- Основной компонент страницы ---
export default function CatalogPage() {
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  // Состояние для всех фильтров
  const [filters, setFilters] = useState<Filters>({
    page: 1, limit: 24, sort: 'shikimori_rating', order: 'desc',
    genres: [], studios: [], year: 'all', status: 'all',
    type: 'all', episodes: 'all', title: '',
  });

  // Списки для выпадающих меню
  const [genresList, setGenresList] = useState<string[]>([]);
  const [studiosList, setStudiosList] = useState<string[]>([]);
  const [yearsList, setYearsList] = useState<number[]>([]);
  
  const debouncedSearchTerm = useDebounce(filters.title, 500);

  // Загрузка списков для фильтров
  useEffect(() => {
    fetch('/api/genres').then(res => res.json()).then(data => setGenresList(data.genres || []));
    fetch('/api/studios').then(res => res.json()).then(data => setStudiosList(data.studios || []));
    fetch('/api/years').then(res => res.json()).then(data => setYearsList(data.years || []));
  }, []);

  // Основная функция для загрузки данных
  const fetchCatalogData = useCallback(async (currentFilters: Filters, isNewFilter = false) => {
    if (isNewFilter) { setLoading(true); setAnimes([]); } 
    else { setLoadingMore(true); }
    setError(null);

    const params = new URLSearchParams({
      page: currentFilters.page.toString(), limit: currentFilters.limit.toString(),
      sort: currentFilters.sort, order: currentFilters.order,
    });
    if (currentFilters.title) params.append('title', currentFilters.title);
    if (currentFilters.year !== 'all') params.append('year', currentFilters.year);
    if (currentFilters.status !== 'all') params.append('status', currentFilters.status);
    if (currentFilters.type !== 'all') params.append('type', currentFilters.type);
    if (currentFilters.episodes !== 'all') params.append('episodes', currentFilters.episodes);
    if (currentFilters.genres.length > 0) params.append('genres', currentFilters.genres.join(','));
    if (currentFilters.studios.length > 0) params.append('studios', currentFilters.studios.join(','));

    try {
      const response = await fetch(`/api/catalog?${params.toString()}`);
      if (!response.ok) throw new Error(`Ошибка сети: ${response.statusText}`);
      
      const data = await response.json();
      setAnimes(prev => isNewFilter ? data.results : [...prev, ...data.results]);
      setHasMore(data.hasMore);
      if(isNewFilter) setTotal(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неизвестная ошибка");
    } finally {
      setLoading(false); setLoadingMore(false);
    }
  }, []);

  // Эффект для перезагрузки данных при изменении любого фильтра
  useEffect(() => {
    const newFilters = { ...filters, page: 1, title: debouncedSearchTerm };
    fetchCatalogData(newFilters, true);
  }, [debouncedSearchTerm, filters.sort, filters.order, filters.genres, filters.studios, filters.year, filters.status, filters.type, filters.episodes, fetchCatalogData]);

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      const newFilters = { ...filters, page: filters.page + 1 };
      setFilters(newFilters);
      fetchCatalogData(newFilters, false);
    }
  };
  
  const handleMultiSelectToggle = (key: 'genres' | 'studios', value: string) => {
    const currentValues = filters[key];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    setFilters(prev => ({ ...prev, [key]: newValues, page: 1 }));
  };

  const handleFilterChange = (key: keyof Omit<Filters, 'genres' | 'studios'>, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Каталог аниме</h1>
        {!loading && <span className="text-muted-foreground">Найдено: {total}</span>}
      </div>
      
      {/* Панель фильтров */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8 p-4 bg-card rounded-lg border">
        <div className="sm:col-span-2 xl:col-span-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Поиск по названию..." className="pl-10" value={filters.title} onChange={e => handleFilterChange('title', e.target.value)} />
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span>{filters.genres.length > 0 ? `Жанры: ${filters.genres.length}` : 'Все жанры'}</span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 max-h-96 overflow-y-auto">
            <DropdownMenuLabel>Выберите жанры</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {genresList.map((genre) => (
              <DropdownMenuCheckboxItem key={genre} checked={filters.genres.includes(genre)} onCheckedChange={() => handleMultiSelectToggle('genres', genre)}>
                {genre}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span>{filters.studios.length > 0 ? `Студии: ${filters.studios.length}` : 'Все студии'}</span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 max-h-96 overflow-y-auto">
            <DropdownMenuLabel>Выберите студии</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {studiosList.map((studio) => (
              <DropdownMenuCheckboxItem key={studio} checked={filters.studios.includes(studio)} onCheckedChange={() => handleMultiSelectToggle('studios', studio)}>
                {studio}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

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

        <Select value={filters.status} onValueChange={value => handleFilterChange('status', value)}>
          <SelectTrigger><SelectValue placeholder="Статус" /></SelectTrigger>
          <SelectContent>
            {Object.entries(STATUS_OPTIONS).map(([key, value]) => (<SelectItem key={key} value={key}>{value}</SelectItem>))}
          </SelectContent>
        </Select>

        <Select value={filters.type} onValueChange={value => handleFilterChange('type', value)}>
          <SelectTrigger><SelectValue placeholder="Тип" /></SelectTrigger>
          <SelectContent>
            {Object.entries(TYPE_OPTIONS).map(([key, value]) => (<SelectItem key={key} value={key}>{value}</SelectItem>))}
          </SelectContent>
        </Select>

        <Select value={filters.episodes} onValueChange={value => handleFilterChange('episodes', value)}>
          <SelectTrigger><SelectValue placeholder="Кол-во серий" /></SelectTrigger>
          <SelectContent>
            {Object.entries(EPISODE_OPTIONS).map(([key, value]) => (<SelectItem key={key} value={key}>{value}</SelectItem>))}
          </SelectContent>
        </Select>

        {(filters.genres.length > 0 || filters.studios.length > 0) && (
             <Button variant="ghost" className="text-sm" onClick={() => { setFilters(prev => ({...prev, genres: [], studios: []})) }}>
                 <X className="w-4 h-4 mr-2" /> Сбросить жанры/студии
             </Button>
        )}
      </div>

      {loading && animes.length === 0 ? (
        <div className="flex justify-center items-center h-64"><LoadingSpinner size="lg" /></div>
      ) : error ? (
        <div className="text-center text-red-500 py-16">{error}</div>
      ) : animes.length === 0 ? (
        <p className="text-center text-muted-foreground py-16">По вашему запросу ничего не найдено.</p>
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
