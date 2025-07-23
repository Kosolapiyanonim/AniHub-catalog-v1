// src/components/search/search-results.tsx

import Image from 'next/image'
import Link from 'next/link'

// Определяем тип для аниме, который будет приходить с нашего API
export type AnimeSearchResult = {
  id: number
  title: string
  poster_url: string | null
  year: number | null
  shikimori_id: string
}

type SearchResultsProps = {
  results: AnimeSearchResult[]
  onClose: () => void // Функция для закрытия меню
}

export function SearchResults({ results, onClose }: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <div className='p-4 text-center text-sm text-muted-foreground'>
        Ничего не найдено.
      </div>
    )
  }

  return (
    <div className='max-h-[70vh] overflow-y-auto'>
      <ul>
        {results.map(anime => (
          <li key={anime.id}>
            <Link
              href={`/anime/${anime.shikimori_id}`}
              className='flex items-center gap-4 p-3 hover:bg-accent'
              onClick={onClose} // Закрываем меню при клике на результат
            >
              <div className='relative h-16 w-12 flex-shrink-0'>
                <Image
                  src={anime.poster_url || '/placeholder.png'}
                  alt={anime.title}
                  fill
                  className='rounded-sm object-cover'
                />
              </div>
              <div>
                <p className='font-semibold'>{anime.title}</p>
                <p className='text-sm text-muted-foreground'>{anime.year}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
