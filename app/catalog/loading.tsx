import { Skeleton } from "@/components/ui/skeleton"
import { AnimeGrid } from "@/components/anime-grid"

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <AnimeGrid>
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="aspect-[2/3] w-full">
            <Skeleton className="h-full w-full rounded-lg" />
            <Skeleton className="mt-2 h-4 w-3/4" />
            <Skeleton className="mt-1 h-3 w-1/2" />
          </div>
        ))}
      </AnimeGrid>
    </div>
  )
}
