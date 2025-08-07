'use client'

import { Anime } from '@/lib/types'
import { AnimeCard } from './anime-card'
import { Button } from '@/components/ui/button'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { User as SupabaseUser } from '@supabase/auth-helpers-nextjs'

interface AnimeGridProps {
  animes: Anime[]
  total: number
  hasMore: boolean
  page: number
  limit: number
  searchParams: { [key: string]: string | string[] | undefined }
  user: SupabaseUser | null
}

export function AnimeGrid({ animes, total, hasMore, page, limit, searchParams, user }: AnimeGridProps) {
  const router = useRouter()
  const currentSearchParams = useSearchParams()

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(currentSearchParams.toString())
      params.set(name, value)
      return params.toString()
    },
    [currentSearchParams]
  )

  const handleLoadMore = () => {
    const nextPage = page + 1
    router.push(`?${createQueryString('page', nextPage.toString())}`, { scroll: false })
  }

  if (animes.length === 0 && page === 1) {
    return (
      <div className="text-center text-muted-foreground py-10">
        <p className="text-lg">По вашему запросу ничего не найдено.</p>
        <p className="text-sm">Попробуйте изменить фильтры или поисковый запрос.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {animes.map((anime) => (
          <AnimeCard key={anime.id} anime={anime} user={user} />
        ))}
      </div>
      {hasMore && (
        <Button
          onClick={handleLoadMore}
          className="mt-8 w-full sm:w-auto"
          variant="outline"
        >
          Загрузить еще
        </Button>
      )}
      <p className="text-sm text-muted-foreground mt-4">
        Показано {Math.min(page * limit, total)} из {total} аниме.
      </p>
    </div>
  )
}
