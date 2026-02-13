import { Suspense } from "react";
import type { Metadata } from "next";

import { HeroSlider } from "@/components/HeroSlider";
import { HomeSectionsDeferred } from "@/components/home-sections-deferred";
import { HomeSectionsSkeleton } from "@/components/home-sections-skeleton";
import { getHomepageHeroCriticalData } from "@/lib/data-fetchers";

export const metadata: Metadata = {
  title: "Смотреть аниме онлайн — Магическая битва и новинки",
  description:
    "Смотрите аниме онлайн на AniHub: Магическая битва, Магическая битва 3 сезон, а также популярные и новые релизы.",
  keywords: ["аниме", "аниме магическая битва", "магическая битва", "магическая битва 3 сезон"],
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "AniHub",
  alternateName: "Анихаб",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://anihub.wtf",
  description:
    "AniHub — каталог, где можно смотреть аниме онлайн, включая Магическая битва и Магическая битва 3 сезон.",
  inLanguage: "ru",
  keywords: "аниме, аниме магическая битва, магическая битва, магическая битва 3 сезон",
};

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
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
