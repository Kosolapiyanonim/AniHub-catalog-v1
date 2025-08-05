import { Suspense } from "react"
import { HeroSlider } from "@/components/HeroSlider"
import { AnimeCarousel } from "@/components/AnimeCarousel"
import { getHomepageSections } from "@/lib/data-fetchers"
import { Skeleton } from "@/components/ui/skeleton"
import { Flame, Clock, Sparkles } from "lucide-react"

export default async function HomePage() {
  const { heroSlider, popular, recentlyUpdated, new: newAnime } = await getHomepageSections()

  return (
    <div className="flex flex-col min-h-screen">
      <div className="container mx-auto px-0 md:px-4">
        <Suspense fallback={<Skeleton className="w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-lg" />}>
          <HeroSlider animeList={heroSlider || []} />
        </Suspense>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12 space-y-12">
        <Suspense fallback={<Skeleton className="w-full h-64" />}>
          <AnimeCarousel title="Популярное" animeList={popular || []} icon={<Flame className="w-7 h-7" />} />
        </Suspense>

        <Suspense fallback={<Skeleton className="w-full h-64" />}>
          <AnimeCarousel
            title="Недавно обновлено"
            animeList={recentlyUpdated || []}
            icon={<Clock className="w-7 h-7" />}
          />
        </Suspense>

        <Suspense fallback={<Skeleton className="w-full h-64" />}>
          <AnimeCarousel title="Новинки" animeList={newAnime || []} icon={<Sparkles className="w-7 h-7" />} />
        </Suspense>
      </div>
    </div>
  )
}
