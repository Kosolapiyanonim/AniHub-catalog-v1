'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useDebounce } from '@/hooks/use-debounce';
import { VisuallyHidden } from '@/components/ui/visually-hidden';

// 1. Обновляем интерфейс, добавляем status и aired_at
interface SearchResult {
  shikimori_id: string;
  title: string;
  poster_url: string | null;
  type: string | null;
  status: string | null;
  aired_at: string | null; // Дата в виде строки "YYYY-MM-DD"
}

// 2. Обновляем функции для форматирования
const formatStatus = (status: string | null) => {
    if (!status) return null;
    const map: { [key: string]: string } = { 'released': 'Вышел', 'ongoing': 'Онгоинг', 'anons': 'Анонс' };
    return map[status.toLowerCase()] || status;
};

const formatType = (type: string | null) => {
    if (!type) return null;
    const map: { [key: string]: string } = {
        'anime-serial': 'TV Сериал',
        'anime': 'Аниме Фильм',
        'tv_series': 'TV Сериал', 'movie': 'Фильм', 'ova': 'OVA', 'ona': 'ONA', 'special': 'Спешл',
    };
    return map[type.toLowerCase()] || type;
};

const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    try {
        return new Date(dateString).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch { return dateString; }
}

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const search = async () => {
      if (debouncedQuery.length < 3) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const response = await fetch(`/api/search?title=${debouncedQuery}`);
        if (response.ok) setResults(await response.json());
      } catch (error) { console.error("Search fetch error:", error); } 
      finally { setLoading(false); }
    };
    search();
  }, [debouncedQuery]);

  const handleSelect = (shikimoriId: string) => {
    onOpenChange(false);
    router.push(`/anime/${shikimoriId}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* 3. Делаем окно поиска больше */}
      <DialogContent className="overflow-hidden p-0 shadow-lg max-w-2xl">
        <VisuallyHidden>
          <DialogTitle>Поиск по сайту</DialogTitle>
        </VisuallyHidden>
        <Command>
          <CommandInput 
            placeholder="Введите название аниме..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {loading && <div className="p-4 text-sm text-center">Загрузка...</div>}
            {!loading && results.length === 0 && debouncedQuery.length > 2 && (
              <CommandEmpty>Ничего не найдено.</CommandEmpty>
            )}
            {results.length > 0 && (
              <CommandGroup>
                {results.map((anime) => (
                  <CommandItem
                    key={anime.shikimori_id}
                    value={anime.title}
                    onSelect={() => handleSelect(anime.shikimori_id)}
                    className="flex items-center gap-4 cursor-pointer p-3"
                  >
                    <div className="relative w-12 h-[72px] bg-slate-700 rounded-md shrink-0">
                      {anime.poster_url && (
                        <Image src={anime.poster_url} alt={anime.title} fill className="object-cover rounded-md" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-medium line-clamp-2">{anime.title}</p>
                      {/* 4. Выводим всю новую информацию */}
                      <div className="text-sm text-gray-400 flex items-center flex-wrap gap-x-2.5 mt-1">
                        <span>{formatType(anime.type)}</span>
                        {anime.aired_at && <span>• {formatDate(anime.aired_at)}</span>}
                        {formatStatus(anime.status) && <span className="text-purple-400 font-medium">• {formatStatus(anime.status)}</span>}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
