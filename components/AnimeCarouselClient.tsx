// /components/AnimeCarouselClient.tsx
"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import { LoadingSpinner } from "@/components/loading-spinner";

// Динамически загружаем реальный карусельный компонент только на клиенте
// Проверьте путь к '@/components/AnimeCarousel' - он должен быть корректным
const DynamicAnimeCarousel = dynamic(
  () => import("@/components/AnimeCarousel").then((mod) => mod.AnimeCarousel), // Убедитесь, что экспорт в AnimeCarousel.tsx называется AnimeCarousel
  {
    // Приятное состояние загрузки во время загрузки JS бандлов
    loading: () => (
      <div className="h-64 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    ),
    ssr: false, // Отключаем рендеринг на стороне сервера для этого тяжелого интерактивного виджета
  }
);

// Повторно экспортируем как обычный функциональный компонент
// Экспорт по умолчанию
export default function AnimeCarouselClient(
  props: ComponentProps<typeof DynamicAnimeCarousel>
) {
  return <DynamicAnimeCarousel {...props} />;
}