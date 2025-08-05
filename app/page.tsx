import { Suspense } from "react"
import { getHomepageSections } from "@/lib/data-fetchers"
import { AnimeCarouselClient } from "@/components/anime-carousel-client"
import { HeroSlider } from "@/components/HeroSlider"
import { Separator } from "@/components/ui/separator"
import { SectionTitle } from "@/components/section-title"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const sections = await getHomepageSections()

  return (
    <div className="flex flex-col gap-8 pb-8">
      <div className="container mx-auto px-4">
        <Suspense fallback={<div>Загрузка Hero Slider...</div>}>
          <HeroSlider />
        </Suspense>
      </div>

      {sections.map((section) => (
        <div key={section.id} className="container mx-auto px-4">
          <SectionTitle title={section.title} />
          <Suspense fallback={<div>Загрузка карусели...</div>}>
            <AnimeCarouselClient animeList={section.anime} />
          </Suspense>
          <Separator className="my-8" />
        </div>
      ))}
    </div>
  )
}
