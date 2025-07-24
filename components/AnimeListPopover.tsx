// components/AnimeListPopover.tsx
"use client";

import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from './ui/badge';
import Link from 'next/link';
import { Button } from './ui/button';
import { Info, Star } from 'lucide-react';
import { AnimeHoverCardListButton } from './anime-hover-card-list-button';

interface AnimeData {
  id: number;
  shikimori_id: string;
  title: string;
  year?: number | null;
  type?: string;
  status?: string;
  episodes_aired: number;
  episodes_total: number;
  description?: string;
  genres?: { name: string }[];
  shikimori_rating?: number;
  user_list_status?: string | null;
}
interface AnimeListPopoverProps {
  anime: AnimeData;
  children: React.ReactNode;
  onStatusChange?: (animeId: number, newStatus: string | null) => void;
}


export function AnimeListPopover({ anime, children, onStatusChange }: AnimeListPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild onMouseEnter={() => setIsOpen(true)}>
        {children}
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 bg-slate-900/80 backdrop-blur-sm border-slate-700 text-white p-4 space-y-3" 
        onMouseLeave={() => setIsOpen(false)}
        side="right" align="start" sideOffset={10}
      >
        <h4 className="font-bold text-lg">{anime.title}</h4>
        <div className="flex items-center gap-2 text-sm text-gray-400">
            {anime.shikimori_rating && <><Star className="w-4 h-4 text-yellow-400" /><span>{anime.shikimori_rating}</span></>}
            {anime.year && <span>• {anime.year}</span>}
        </div>
        <p className="text-sm text-gray-300 line-clamp-3">{anime.description || "Описание отсутствует."}</p>
        <div className="flex flex-wrap gap-1">
            {anime.genres?.slice(0, 3).map(g => <Badge key={g.name} variant="secondary">{g.name}</Badge>)}
        </div>
        
        <AnimeHoverCardListButton animeId={anime.id} initialStatus={anime.user_list_status} onStatusChange={onStatusChange} />
        
        <Button variant="outline" size="sm" className="w-full" asChild>
            <Link href={`/anime/${anime.shikimori_id}`}><Info className="w-4 h-4 mr-2" />Подробнее</Link>
        </Button>
      </PopoverContent>
    </Popover>
  );
}
