'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
// [ИСПРАВЛЕНИЕ] Импортируем DialogContent и DialogTitle отдельно
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useDebounce } from '@/hooks/use-debounce';
import { VisuallyHidden } from '@/components/ui/visually-hidden';

interface SearchResult {
  shikimori_id: string;
  title: string;
  poster_url: string | null;
  year: number | null;
  type: string | null;
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
        if (response.ok) {
          const data = await response.json();
          setResults(data);
        }
      } catch (error) {
        console.error("Search fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    search();
  }, [debouncedQuery]);

  const handleSelect = (shikimoriId: string) => {
    onOpenChange(false);
    router.push(`/anime/${shikimoriId}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* [ИСПРАВЛЕНИЕ] Используем <DialogContent> вместо <Dialog.Content> */}
      <DialogContent className="overflow-hidden p-0 shadow-lg">
        <VisuallyHidden>
          <DialogTitle>Поиск по сайту</DialogTitle>
        </VisuallyHidden>

        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:p-2 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
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
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <div className="relative w-10 h-14 bg-slate-700 rounded-sm shrink-0">
                      {anime.poster_url && (
                        <Image src={anime.poster_url} alt={anime.title} fill className="object-cover rounded-sm" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{anime.title}</p>
                      <p className="text-xs text-gray-400">{anime.year} • {anime.type}</p>
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
