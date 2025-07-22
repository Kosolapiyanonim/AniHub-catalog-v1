'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverAnchor } from '@/components/ui/popover';
import { Loader2, Search } from 'lucide-react';

// [ИЗМЕНЕНИЕ] 1. Обновляем интерфейс, добавляем status
interface SearchResult {
  shikimori_id: string;
  title: string;
  poster_url: string | null;
  year: number | null;
  type: string | null;
  status: string | null; // Новое поле
}

// [ИЗМЕНЕНИЕ] 2. Добавляем функции для форматирования
const formatStatus = (status: string | null) => {
    if (!status) return null;
    const map: { [key: string]: string } = {
        'released': 'Вышел',
        'ongoing': 'Онгоинг',
        'anons': 'Анонс',
    };
    return map[status.toLowerCase()] || status;
};

const formatType = (type: string | null) => {
    if (!type) return null;
    const map: { [key: string]: string } = {
        'anime-serial': 'TV Сериал',
        'tv_series': 'TV Сериал',
        'anime': 'Фильм',
        'movie': 'Фильм',
        'ova': 'OVA',
        'ona': 'ONA',
        'special': 'Спешл',
    };
    return map[type.toLowerCase()] || type;
};

// Custom hook for debouncing
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export function HeaderSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const search = async () => {
      if (debouncedQuery.length < 3) {
        setResults([]);
        setIsOpen(false);
        return;
      }
      setLoading(true);
      try {
        const response = await fetch(`/api/search?title=${debouncedQuery}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data);
          setIsOpen(data.length > 0);
        }
      } catch (error) {
        console.error("Search fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    search();
  }, [debouncedQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/catalog?title=${query.trim()}`);
      setIsOpen(false);
      setQuery('');
    }
  };
  
  const handleResultClick = () => {
    setIsOpen(false);
    setQuery('');
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <form onSubmit={handleSearchSubmit} className="relative w-full max-w-sm">
        <PopoverAnchor asChild>
          {/* ... input поиска без изменений ... */}
        </PopoverAnchor>

        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2">
          {results.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              {results.map((anime) => (
                <Link
                  key={anime.shikimori_id}
                  href={`/anime/${anime.shikimori_id}`}
                  onClick={handleResultClick}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-700"
                >
                  <div className="relative w-10 h-14 bg-slate-700 rounded-sm shrink-0">
                    {anime.poster_url && (
                      <Image src={anime.poster_url} alt={anime.title} fill className="object-cover rounded-sm" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium line-clamp-2">{anime.title}</p>
                    {/* [ИЗМЕНЕНИЕ] 3. Выводим новую, форматированную информацию */}
                    <div className="text-xs text-gray-400 flex items-center flex-wrap gap-x-1.5">
                      <span>{formatType(anime.type)}</span>
                      {anime.year && <span>• {anime.year}</span>}
                      {formatStatus(anime.status) && <span className="text-purple-400 font-medium">• {formatStatus(anime.status)}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-center text-gray-400 py-4">Ничего не найдено</p>
          )}
        </PopoverContent>
      </form>
    </Popover>
  );
}
