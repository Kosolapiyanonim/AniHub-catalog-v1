import { HeroSlider } from "@/components/HeroSlider"
import { AnimeCarousel } from "@/components/anime-carousel"
import { getHomepageSections } from "@/lib/data-fetchers"

export default async function HomePage() {
  const sections = await getHomepageSections()

  return (
    <>
<<<<<<< HEAD
      {/* HeroSlider теперь может быть как полноэкранным, так и обычным */}
      <HeroSlider items={data.hero} />

      {/* Основной контент с каруселями */}
      <div className="bg-slate-900 relative z-10">
        <main className="container mx-auto px-4 py-12 space-y-12">
          <Suspense fallback={<LoadingSpinner />}>
            <AnimeCarousel
              title="Тренды сезона"
              items={data.trending}
              viewAllLink="/catalog?sort=shikimori_rating"
              icon={<TrendingUp />}
            />
          </Suspense>

          <Suspense fallback={<LoadingSpinner />}>
            <AnimeCarousel
              title="Самое популярное"
              items={data.popular}
              viewAllLink="/catalog?sort=shikimori_votes"
              icon={<Star />}
            />
          </Suspense>

          <Suspense fallback={<LoadingSpinner />}>
            <AnimeCarousel
              title="Недавно обновленные"
              items={data.latestUpdates}
              viewAllLink="/catalog?sort=updated_at_kodik"
              icon={<RotateCw />}
            />
          </Suspense>
        </main>
      </div>
=======
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
>>>>>>> d15e1ac7e3a8179422a2ca626510fe77d8fcf999
    </>
  )
}
