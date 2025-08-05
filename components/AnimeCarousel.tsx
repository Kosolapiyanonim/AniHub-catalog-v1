import { AnimeCard } from "@/components/anime-card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { SectionTitle } from "@/components/section-title"
import type { Anime } from "@/lib/types"

interface AnimeCarouselProps {
  title: string
  animeList: Anime[]
}

export function AnimeCarousel({ title, animeList }: AnimeCarouselProps) {
  if (!animeList || animeList.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      {title && <SectionTitle title={title} />}
      <Carousel
        opts={{
          align: "start",
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {animeList.map((anime) => (
            <CarouselItem key={anime.id} className="pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6">
              <AnimeCard anime={anime} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  )
}
