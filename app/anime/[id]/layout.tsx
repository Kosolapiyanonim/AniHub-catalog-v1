import type { Metadata } from "next";
import { getAnimeSeoData } from "@/lib/server/anime-seo";

interface AnimeLayoutProps {
  children: React.ReactNode;
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: Omit<AnimeLayoutProps, "children">): Promise<Metadata> {
  const anime = await getAnimeSeoData(params.id);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://anihub.wtf";
  const canonicalUrl = `${siteUrl}/anime/${params.id}`;

  if (!anime) {
    return {
      title: "Аниме не найдено | AniHub",
      description: "Страница аниме временно недоступна.",
      alternates: { canonical: canonicalUrl },
      robots: { index: false, follow: true },
    };
  }

  const plainDescription = anime.description
    ? anime.description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
    : "Смотрите аниме онлайн на AniHub: описания, жанры, рейтинги и связанные тайтлы.";

  const description = plainDescription.slice(0, 160);
  const image = anime.poster_url || `${siteUrl}/placeholder.jpg`;

  return {
    title: `${anime.title} — смотреть онлайн | AniHub`,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${anime.title} — AniHub`,
      description,
      url: canonicalUrl,
      siteName: "AniHub",
      type: "video.other",
      images: [
        {
          url: image,
          alt: anime.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${anime.title} — AniHub`,
      description,
      images: [image],
    },
  };
}

export default async function AnimeLayout({ children, params }: AnimeLayoutProps) {
  const anime = await getAnimeSeoData(params.id);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://anihub.wtf";
  const canonicalUrl = `${siteUrl}/anime/${params.id}`;

  const jsonLd = anime
    ? {
        "@context": "https://schema.org",
        "@type": "TVSeries",
        name: anime.title,
        description: anime.description
          ? anime.description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
          : undefined,
        image: anime.poster_url || `${siteUrl}/placeholder.jpg`,
        url: canonicalUrl,
      }
    : null;

  return (
    <>
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
      {children}
    </>
  );
}
