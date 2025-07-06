// /app/anime/[id]/page.tsx
import { notFound } from "next/navigation";
import Image from 'next/image';
// ...другие импорты

async function getAnimeData(id: string) {
  // Мы делаем fetch к нашему собственному API
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/anime/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default async function AnimePage({ params }: { params: { id: string } }) {
  const anime = await getAnimeData(params.id);
  if (!anime) {
    notFound();
  }

  return (
    <div>
      <h1>{anime.title}</h1>
      <p>Год: {anime.year}</p>
      <p>Жанры: {anime.genres?.join(', ')}</p>
      <iframe src={`https:${anime.player_link}`} style={{width: '100%', aspectRatio: '16/9'}}/>
    </div>
  );
}
