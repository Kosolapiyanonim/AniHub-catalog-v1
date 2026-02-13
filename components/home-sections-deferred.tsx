import { use } from "react";

import { AnimeCarousel } from "@/components/anime-carousel";
import { AnimatedSection } from "@/components/animated-section";
import type { getHomepageSectionsDeferred } from "@/lib/data-fetchers";

type DeferredSectionsPromise = ReturnType<typeof getHomepageSectionsDeferred>;

interface HomeSectionsDeferredProps {
  sectionsPromise: DeferredSectionsPromise;
}

export function HomeSectionsDeferred({ sectionsPromise }: HomeSectionsDeferredProps) {
  const sections = use(sectionsPromise);
  const hasAnySection =
    (sections.popular?.length ?? 0) > 0 ||
    (sections.trending?.length ?? 0) > 0 ||
    (sections.latestUpdates?.length ?? 0) > 0;

  return (
    <>
      {sections.popular && sections.popular.length > 0 && (
        <AnimatedSection>
          <AnimeCarousel title="Популярное" items={sections.popular} viewAllLink="/catalog?sort=popular" />
        </AnimatedSection>
      )}

      {sections.trending && sections.trending.length > 0 && (
        <AnimatedSection delay={100}>
          <AnimeCarousel title="В тренде" items={sections.trending} viewAllLink="/catalog?sort=trending" />
        </AnimatedSection>
      )}

      {sections.latestUpdates && sections.latestUpdates.length > 0 && (
        <AnimatedSection delay={200}>
          <AnimeCarousel title="Последние обновления" items={sections.latestUpdates} viewAllLink="/catalog?sort=updated" />
        </AnimatedSection>
      )}

      {!hasAnySection && (
        <section className="rounded-lg border border-border/60 bg-card p-6 text-sm text-muted-foreground">
          Сейчас нет контента для главной страницы. Проверьте логи [HOMEPAGE] на сервере и наполнение таблицы animes.
        </section>
      )}
    </>
  );
}
