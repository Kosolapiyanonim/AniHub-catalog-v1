import { getHomepageSections } from "@/lib/data-fetchers";
import HeroSlider from "@/components/HeroSlider";
import { HeroSection } from "@/components/hero-section";
import { AnimeCarousel } from "@/components/AnimeCarousel";

export default async function HomePage() {
  const sections = await getHomepageSections();

  return (
    <div className="flex flex-col min-h-screen">
      <HeroSlider slides={sections.hero} />
      <div className="container mx-auto px-4 py-8 space-y-12">
        {sections.popular && (
          <HeroSection title="Популярное" href="/popular">
            <AnimeCarousel animes={sections.popular} />
          </HeroSection>
        )}
        {sections.trending && (
          <HeroSection title="В тренде" href="/catalog?sort=trending">
            <AnimeCarousel animes={sections.trending} />
          </HeroSection>
        )}
        {sections.latestUpdates && (
          <HeroSection title="Последние обновления" href="/catalog?sort=updated">
            <AnimeCarousel animes={sections.latestUpdates} />
          </HeroSection>
        )}
      </div>
    </div>
  );
}
