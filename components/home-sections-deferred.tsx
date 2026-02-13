import { AnimeCarousel } from "@/components/anime-carousel";
import { AnimatedSection } from "@/components/animated-section";
import { getHomepageSectionsDeferred } from "@/lib/data-fetchers";

export async function HomeSectionsDeferred() {
  try {
    const sections = await getHomepageSectionsDeferred();
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
            Контент для секций главной пока не найден. Проверьте данные в таблице animes и server-логи [HOMEPAGE].
          </section>
        )}
      </>
    );
  } catch (error) {
    console.error("[HOMEPAGE][ERROR]", {
      stage: "sections_render",
      message: "Не удалось отрисовать вторичные секции",
      error: error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : error,
    });

    return (
      <section className="rounded-lg border border-destructive/40 bg-destructive/10 p-6 text-sm text-destructive">
        Не удалось загрузить секции главной страницы. Попробуйте обновить страницу позже.
      </section>
    );
  }
}
