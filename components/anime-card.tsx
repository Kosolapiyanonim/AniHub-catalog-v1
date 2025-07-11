// /components/anime-card.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';

interface AnimeCardProps {
  anime: {
    id: number;
    shikimori_id: string;
    title: string;
    poster_url?: string | null;
    year?: number | null;
  };
  priority?: boolean; // Добавим возможность задавать приоритет для первых карточек
}

export function AnimeCard({ anime, priority = false }: AnimeCardProps) {
  if (!anime || !anime.shikimori_id) {
    return null;
  }

  return (
    <Link href={`/anime/${anime.shikimori_id}`} key={anime.id} className="group cursor-pointer block">
      <div className="aspect-[2/3] overflow-hidden rounded-lg bg-slate-800 relative">
        {anime.poster_url ? (
          <Image
            src={anime.poster_url}
            alt={anime.title}
            fill
            // ИЗМЕНЕНИЕ: Добавляем атрибут sizes для адаптивности
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority={priority} // Используем приоритет
          />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500 text-center text-xs p-2">
            Постер отсутствует
          </div>
        )}
      </div>
      <h3 className="mt-2 text-sm font-medium text-white truncate group-hover:text-purple-400">
        {anime.title}
      </h3>
      {anime.year && <p className="text-xs text-slate-400">{anime.year}</p>}
    </Link>
  );
}
