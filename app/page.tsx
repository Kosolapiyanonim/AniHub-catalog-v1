import { HeroSlider } from "@/components/HeroSlider"
import { AnimeCarousel } from "@/components/anime-carousel"
import { AnimatedSection } from "@/components/animated-section"
import { HomeHeroEnhancer } from "@/components/home-hero-enhancer"
import { HomeSecondarySections } from "@/components/home-secondary-sections"
import { ServerFirstHero } from "@/components/server-first-hero"
import { getHomeHeroCriticalData, getHomepageSections } from "@/lib/data-fetchers"

export const revalidate = 300

const HOME_SERVER_FIRST_HERO = process.env.NEXT_PUBLIC_HOME_SERVER_FIRST_HERO !== "false"
const HOME_DEFERRED_SECTIONS = process.env.NEXT_PUBLIC_HOME_DEFERRED_SECTIONS !== "false"

export default async function HomePage() {
  if (!HOME_SERVER_FIRST_HERO || !HOME_DEFERRED_SECTIONS) {
    const sections = await getHomepageSections()

    return (
      <>
        <div className="-mt-16">
          <HeroSlider items={sections.hero} />
        </div>

        <main className="container mx-auto space-y-16 px-4 py-12">
          {sections.popular && sections.popular.length > 0 ? (
            <AnimatedSection>
              <AnimeCarousel title="Популярное" items={sections.popular} viewAllLink="/catalog?sort=popular" />
            </AnimatedSection>
          ) : null}

          {sections.trending && sections.trending.length > 0 ? (
            <AnimatedSection delay={100}>
              <AnimeCarousel title="В тренде" items={sections.trending} viewAllLink="/catalog?sort=trending" />
            </AnimatedSection>
          ) : null}

          {sections.latestUpdates && sections.latestUpdates.length > 0 ? (
            <AnimatedSection delay={200}>
              <AnimeCarousel title="Последние обновления" items={sections.latestUpdates} viewAllLink="/catalog?sort=updated" />
            </AnimatedSection>
          ) : null}
        </main>
      </>
    )
  }

  const heroItems = await getHomeHeroCriticalData()
  const criticalHero = heroItems[0] || null

  return (
    <>
      <div className="relative -mt-16">
        <ServerFirstHero item={criticalHero} />
        <HomeHeroEnhancer items={heroItems} />
      </div>

      <main className="container mx-auto space-y-16 px-4 py-12">
        <HomeSecondarySections />
      </main>
    </>
  )
}
