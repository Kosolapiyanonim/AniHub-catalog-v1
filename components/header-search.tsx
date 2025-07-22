'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverAnchor } from '@/components/ui/popover';
import { Loader2, Search } from 'lucide-react';

interface SearchResult {
  shikimori_id: string;
  title: string;
  poster_url: string | null;
  year: number | null;
  type: string | null;
}

// Custom hook for debouncing
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export function HeaderSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const debouncedQuery = useDebounce(query, 300); // 300ms задержка

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
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                type="text"
                placeholder="Поиск аниме..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 bg-slate-700 border-slate-600"
                />
                {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />}
            </div>
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
                  <div>
                    <p className="text-sm font-medium line-clamp-2">{anime.title}</p>
                    <p className="text-xs text-gray-400">{anime.year} • {anime.type}</p>
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
