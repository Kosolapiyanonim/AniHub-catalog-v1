// Замените содержимое файла: /components/anime-card.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';

interface AnimeCardProps {
  anime: {
    id: number; // Внутренний ID из базы
    shikimori_id: string; // ID от Shikimori
    title: string;
    poster_url?: string;
    year?: number;
  };
}

export function AnimeCard({ anime }: AnimeCardProps) {
  // Проверяем, что у аниме есть shikimori_id, так как он используется для ссылки.
  if (!anime || !anime.shikimori_id) {
    return null;
  }

  return (
    // Ссылка теперь всегда строится на основе shikimori_id.
    <Link href={`/anime/${anime.shikimori_id}`} key={anime.id} className="group cursor-pointer block">
      <div className="aspect-[2/3] overflow-hidden rounded-lg bg-slate-800 relative">
        {anime.poster_url ? (
          <Image
            src={anime.poster_url}
            alt={anime.title}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">Нет постера</div>
        )}
      </div>
      <h3 className="mt-2 text-sm font-medium text-white truncate group-hover:text-purple-400">{anime.title}</h3>
      {anime.year && <p className="text-xs text-slate-400">{anime.year}</p>}
    </Link>
  );
}
