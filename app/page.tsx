import { Suspense } from "react";

import { HeroSlider } from "@/components/HeroSlider";
import { HomeSectionsDeferred } from "@/components/home-sections-deferred";
import { HomeSectionsSkeleton } from "@/components/home-sections-skeleton";
import { getHomepageHeroCriticalData, getHomepageSectionsDeferred } from "@/lib/data-fetchers";

export default async function HomePage() {
  const heroItems = await getHomepageHeroCriticalData();
  const deferredSectionsPromise = getHomepageSectionsDeferred();

  return (
    <>
      <div className="-mt-16">
        <HeroSlider items={heroItems} />
      </div>

      <main className="container mx-auto px-4 py-12 space-y-16">
        <Suspense fallback={<HomeSectionsSkeleton />}>
          <HomeSectionsDeferred sectionsPromise={deferredSectionsPromise} />
        </Suspense>
      </main>
    </>
  );
}
