// /app/page.tsx

 import { HeroSlider } from "@/components/HeroSlider";
 import { AnimeCarousel } from "@/components/AnimeCarousel";
 import { LoadingSpinner } from "@/components/loading-spinner";
 import { TrendingUp, Star, Zap, CheckCircle } from "lucide-react";
 import { Suspense } from "react";
 import { getHomePageData } from "@/lib/data-fetchers";

 export const dynamic = 'force-dynamic';

 export default async function HomePage() {
   const data = await getHomePageData();

   return (
     <div className="min-h-screen bg-slate-900">
       <HeroSlider items={data.hero} />

       <main className="container mx-auto px-4 py-12 space-y-12">
         <Suspense fallback={<LoadingSpinner />}>
           <AnimeCarousel
             title="Тренди сезону"
             items={data.trending}
             viewAllLink="/catalog?sort=updated_at"
             icon={<TrendingUp />}
           />
         </Suspense>

         <Suspense fallback={<LoadingSpinner />}>
           <AnimeCarousel
             title="Найпопулярніше"
             items={data.popular}
             viewAllLink="/catalog?sort=shikimori_votes"
             icon={<Star />}
           />
         </Suspense>
       </main>
     </div>
   );
 }
