import { HeroSlider } from "@/components/HeroSlider"
import { AnimeCarousel } from "@/components/anime-carousel"
import { AnimatedSection } from "@/components/animated-section"
import { getHomepageSections } from "@/lib/data-fetchers"

export default async function HomePage() {
  const sections = await getHomepageSections()

  return (
    <>
      <div className="-mt-16">
        <HeroSlider items={sections.hero} />
      </div>
      
      <main className="container mx-auto px-4 py-12 space-y-16">
        {sections.popular && sections.popular.length > 0 && (
          <AnimatedSection>
            <AnimeCarousel
              title="Популярное"
              items={sections.popular}
              viewAllLink="/catalog?sort=popular"
            />
          </AnimatedSection>
        )}

        {sections.trending && sections.trending.length > 0 && (
          <AnimatedSection delay={100}>
            <AnimeCarousel
              title="В тренде"
              items={sections.trending}
              viewAllLink="/catalog?sort=trending"
            />
          </AnimatedSection>
        )}

        {sections.latestUpdates && sections.latestUpdates.length > 0 && (
          <AnimatedSection delay={200}>
            <AnimeCarousel
              title="Последние обновления"
              items={sections.latestUpdates}
              viewAllLink="/catalog?sort=updated"
            />
          </AnimatedSection>
        )}
      </main>
    </>
  )
}
