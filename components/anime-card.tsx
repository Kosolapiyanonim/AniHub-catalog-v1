// /components/anime-card.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Badge } from './ui/badge';
import { AddToListButton } from './AddToListButton';
import { Star } from 'lucide-react';

// Уточняем тип, чтобы он включал все нужные поля
interface Anime {
  id: number;
  shikimori_id: string;
  title: string;
  poster_url?: string | null;
  year?: number | null;
  type?: string;
  shikimori_rating?: number;
  description?: string;
  genres?: { name: string }[];
  user_list_status?: string | null;
}

interface AnimeCardProps {
  anime: Anime;
  priority?: boolean;
}

export function AnimeCard({ anime, priority = false }: AnimeCardProps) {
  // ИСПРАВЛЕНИЕ: Более надежная проверка
  if (!anime || !anime.shikimori_id) {
    return null;
  }

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <Link href={`/anime/${anime.shikimori_id}`} className="block">
          <div className="group relative">
            <div className="aspect-[2/3] overflow-hidden rounded-lg bg-slate-800 relative">
              {anime.poster_url ? (
                <Image
                  src={anime.poster_url}
                  alt={anime.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  priority={priority}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500 text-center text-xs p-2">
                  Постер отсутствует
                </div>
              )}
            </div>
            <div className="mt-2">
              <h3 className="text-sm font-medium text-white truncate group-hover:text-purple-400">
                {anime.title}
              </h3>
              {anime.year && <p className="text-xs text-slate-400">{anime.year}</p>}
            </div>
          </div>
        </Link>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 bg-slate-800 border-slate-700 text-white" side="right" align="start">
        <div className="space-y-3">
          <h3 className="font-bold">{anime.title}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            {anime.shikimori_rating && <><Star className="w-4 h-4 text-yellow-400" /><span>{anime.shikimori_rating}</span></>}
            {anime.year && <span>• {anime.year}</span>}
            {anime.type && <span>• {anime.type.replace(/_/g, ' ')}</span>}
          </div>
          <p className="text-sm text-gray-300 line-clamp-4">
            {anime.description}
          </p>
          <div className="flex flex-wrap gap-1">
            {anime.genres?.slice(0, 3).map(g => <Badge key={g.name} variant="secondary">{g.name}</Badge>)}
          </div>
          <div className="pt-2">
            <AddToListButton animeId={anime.id} initialStatus={anime.user_list_status} />
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
