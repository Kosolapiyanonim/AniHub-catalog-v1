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
            href="/popular"
          />
        )}

        {sections.latest && sections.latest.length > 0 && (
          <AnimeCarousel
            title="Последние обновления"
            items={sections.latest}
            href="/catalog?sort=updated"
          />
        )}

        {sections.ongoing && sections.ongoing.length > 0 && (
          <AnimeCarousel
            title="Онгоинги"
            items={sections.ongoing}
            href="/catalog?status=ongoing"
          />
        )}

        {sections.completed && sections.completed.length > 0 && (
          <AnimeCarousel
            title="Завершённые"
            items={sections.completed}
            href="/catalog?status=completed"
          />
        )}
      </main>
    </>
  )
}
