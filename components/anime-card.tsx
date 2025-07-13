// /components/anime-card.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { AddToListButtonOnCard } from './AddToListButtonOnCard';

interface AnimeCardProps {
  anime: {
    id: number;
    shikimori_id: string;
    title: string;
    poster_url?: string | null;
    year?: number | null;
    user_list_status?: string | null;
  };
  priority?: boolean;
}

export function AnimeCard({ anime, priority = false }: AnimeCardProps) {
  if (!anime || !anime.shikimori_id) {
    return null;
  }

  return (
    // ИЗМЕНЕНИЕ: Обертка для отслеживания наведения
    <div className="group relative">
      <Link href={`/anime/${anime.shikimori_id}`} className="cursor-pointer block">
        <div className="aspect-[2/3] overflow-hidden rounded-lg bg-slate-800 relative">
          {anime.poster_url ? (
            <Image
              src={anime.poster_url}
              alt={anime.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              priority={priority}
              quality={75}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 text-center text-xs p-2">
              Постер отсутствует
            </div>
          )}
        </div>
      </Link>
      
      {/* ИЗМЕНЕНИЕ: Кнопка появляется при наведении */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
         <AddToListButtonOnCard animeId={anime.id} initialStatus={anime.user_list_status} />
      </div>

      <div className="mt-2">
        <Link href={`/anime/${anime.shikimori_id}`} className="cursor-pointer">
            <h3 className="text-sm font-medium text-white truncate group-hover:text-purple-400">
                {anime.title}
            </h3>
        </Link>
        {anime.year && <p className="text-xs text-slate-400">{anime.year}</p>}
      </div>
    </div>
  );
}
