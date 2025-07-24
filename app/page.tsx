import { Suspense } from "react"
import { HeroSlider } from "@/components/HeroSlider"
import { AnimeCarouselClient } from "@/components/anime-carousel-client"
import { Skeleton } from "@/components/ui/skeleton"

function HeroSkeleton() {
  return (
    <div className="relative h-[50vh] sm:h-[60vh] lg:h-[70vh] bg-slate-800 rounded-lg overflow-hidden">
      <Skeleton className="w-full h-full" />
    </div>
  )
}

function CarouselSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-[2/3] w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-6 sm:py-8">
        <Suspense fallback={<HeroSkeleton />}>
          <HeroSlider />
        </Suspense>
      </section>

      {/* Content Sections */}
      <div className="container mx-auto px-4 space-y-8 sm:space-y-12 pb-8 sm:pb-12">
        {/* Popular Anime */}
        <section>
          <Suspense fallback={<CarouselSkeleton />}>
            <AnimeCarouselClient title="Популярные аниме" endpoint="/api/homepage-sections?section=popular" />
          </Suspense>
        </section>

        {/* Latest Updates */}
        <section>
          <Suspense fallback={<CarouselSkeleton />}>
            <AnimeCarouselClient title="Последние обновления" endpoint="/api/homepage-sections?section=latest" />
          </Suspense>
        </section>

        {/* Top Rated */}
        <section>
          <Suspense fallback={<CarouselSkeleton />}>
            <AnimeCarouselClient title="Лучшие по рейтингу" endpoint="/api/homepage-sections?section=top_rated" />
          </Suspense>
        </section>

        {/* Ongoing Series */}
        <section>
          <Suspense fallback={<CarouselSkeleton />}>
            <AnimeCarouselClient title="Онгоинги" endpoint="/api/homepage-sections?section=ongoing" />
          </Suspense>
        </section>
      </div>
    </div>
  )
}
