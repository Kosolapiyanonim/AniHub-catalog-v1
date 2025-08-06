import { HeroSlider } from "@/components/HeroSlider"
import { AnimeCarousel } from "@/components/anime-carousel"
import { getHomepageSections } from "@/lib/data-fetchers"

export default async function HomePage() {
  const sections = await getHomepageSections()

  return (
    <>
      {/* Hero Slider - вне main для полноэкранного режима */}
      <HeroSlider items={sections.hero} />
      
      {/* Основной контент */}
      <main className="container mx-auto px-4 py-8 space-y-12">
        {sections.popular && sections.popular.length > 0 && (
          <AnimeCarousel
            title="Популярное"
            items={sections.popular}
            href="/catalog?sort=popular"
          />
        )}

        {sections.trending && sections.trending.length > 0 && (
          <AnimeCarousel
            title="В тренде"
            items={sections.trending}
            href="/catalog?sort=trending"
          />
        )}

        {sections.latestUpdates && sections.latestUpdates.length > 0 && (
          <AnimeCarousel
            title="Последние обновления"
            items={sections.latestUpdates}
            href="/catalog?sort=updated"
          />
        )}
      </main>
    </>
  )
}
