import { Suspense } from "react";

import { HeroSlider } from "@/components/HeroSlider";
import { HomeSectionsDeferred } from "@/components/home-sections-deferred";
import { HomeSectionsSkeleton } from "@/components/home-sections-skeleton";
import { getHomepageHeroCriticalData } from "@/lib/data-fetchers";

export default async function HomePage() {
  try {
    const heroItems = await getHomepageHeroCriticalData();

    console.log("[HOMEPAGE][INFO]", {
      stage: "page_render",
      message: "HomePage server render started",
      heroItemsCount: heroItems.length,
    });

    const hasHero = heroItems.length > 0;

    return (
      <>
        {hasHero ? (
          <div className="-mt-16">
            <HeroSlider items={heroItems} />
          </div>
        ) : (
          <section className="container mx-auto px-4 pt-24 pb-6">
            <div className="rounded-lg border border-border/60 bg-card p-5 text-sm text-muted-foreground">
              Hero-секция временно недоступна. Ниже отображаются основные подборки каталога.
            </div>
          </section>
        )}

        <main className="container mx-auto px-4 py-8 space-y-16">
          <Suspense fallback={<HomeSectionsSkeleton />}>
            <HomeSectionsDeferred />
          </Suspense>
        </main>
      </>
    );
  } catch (error) {
    console.error("[HOMEPAGE][ERROR]", {
      stage: "page_render",
      message: "HomePage failed during server render",
      error: error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : error,
    });

    return (
      <main className="container mx-auto px-4 py-12">
        <p className="text-muted-foreground">Не удалось загрузить главную страницу. Попробуйте обновить страницу.</p>
      </main>
    );
  }
}
