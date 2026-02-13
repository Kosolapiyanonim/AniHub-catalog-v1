import { HomeHeroEnhancer } from "@/components/home-hero-enhancer"
import { HomeSecondarySections } from "@/components/home-secondary-sections"
import { ServerFirstHero } from "@/components/server-first-hero"
import { getHomeHeroCriticalData } from "@/lib/data-fetchers"

export const revalidate = 300

const HOME_SERVER_FIRST_HERO = process.env.NEXT_PUBLIC_HOME_SERVER_FIRST_HERO !== "false"
const HOME_DEFERRED_SECTIONS = process.env.NEXT_PUBLIC_HOME_DEFERRED_SECTIONS !== "false"

export default async function HomePage() {
  const heroItems = HOME_SERVER_FIRST_HERO ? await getHomeHeroCriticalData() : []
  const criticalHero = heroItems[0] || null

  return (
    <>
      <div className="relative -mt-16">
        <ServerFirstHero item={criticalHero} />
        {HOME_SERVER_FIRST_HERO ? <HomeHeroEnhancer items={heroItems} /> : null}
      </div>

      <main className="container mx-auto space-y-16 px-4 py-12">
        {HOME_DEFERRED_SECTIONS ? <HomeSecondarySections /> : null}
      </main>
    </>
  )
}
