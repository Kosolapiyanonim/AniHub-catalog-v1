"use client"
import Image from "next/image"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import type { Anime } from "@/lib/types"

interface HeroSliderProps {
  animeList?: Anime[]
}

const defaultAnimeList: Anime[] = [
  {
    id: 1,
    shikimori_id: 21,
    title: "One Piece",
    russian: "Ван-Пис",
    poster_url: "/placeholder.svg?height=1080&width=1920",
    type: "tv_series",
    year: 1999,
    shikimori_rating: 8.7,
    status: "ongoing",
    episodes_total: 1000,
    duration: "24 min.",
    rating_mpaa: "PG-13",
    description:
      "Monkey D. Luffy refuses to let anyone stand in the way of his quest to become the king of all pirates. With a course charted for the treacherous waters of the Grand Line and beyond, this is one captain who'll never give up until he's claimed the greatest treasure on Earth: the Legendary One Piece!",
    kodik_id: "12345",
    anime_kind: "tv",
    user_list_status: null,
  },
  {
    id: 2,
    shikimori_id: 40028,
    title: "Attack on Titan: The Final Season",
    russian: "Атака титанов: Финал",
    poster_url: "/placeholder.svg?height=1080&width=1920",
    type: "tv_series",
    year: 2020,
    shikimori_rating: 9.1,
    status: "completed",
    episodes_total: 28,
    duration: "24 min.",
    rating_mpaa: "R",
    description:
      "With the Titans eliminated, the war is far from over. Humanity still faces threats from beyond the walls, and the true nature of the world is slowly revealed.",
    kodik_id: "67890",
    anime_kind: "tv",
    user_list_status: null,
  },
  {
    id: 3,
    shikimori_id: 51142,
    title: "Chainsaw Man",
    russian: "Человек-бензопила",
    poster_url: "/placeholder.svg?height=1080&width=1920",
    type: "tv_series",
    year: 2022,
    shikimori_rating: 8.6,
    status: "completed",
    episodes_total: 12,
    duration: "24 min.",
    rating_mpaa: "R",
    description:
      "Denji, a teenage boy living with a Chainsaw Devil named Pochita, is forced to pay off his deceased father's debt by harvesting devil corpses. After being killed by a devil, Pochita sacrifices himself to revive Denji, who becomes a human-devil hybrid.",
    kodik_id: "11223",
    anime_kind: "tv",
    user_list_status: null,
  },
]

export function HeroSlider({ animeList = defaultAnimeList }: HeroSliderProps) {
  return (
    <Carousel className="w-full relative">
      <CarouselContent>
        {animeList.map((anime) => (
          <CarouselItem key={anime.id}>
            <Card className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] xl:h-[700px] rounded-lg overflow-hidden">
              <Image
                src={anime.poster_url || "/placeholder.svg?height=700&width=1200&query=anime hero banner"}
                alt={anime.title || "Anime banner"}
                fill
                className="object-cover object-center"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <CardContent className="absolute bottom-0 left-0 p-6 md:p-8 text-white w-full md:w-2/3 lg:w-1/2">
                <h2 className="text-3xl md:text-5xl font-bold mb-2 line-clamp-2">{anime.russian || anime.title}</h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  {anime.type && (
                    <Badge variant="secondary" className="bg-purple-600/80 text-white">
                      {anime.type}
                    </Badge>
                  )}
                  {anime.year && (
                    <Badge variant="secondary" className="bg-purple-600/80 text-white">
                      {anime.year}
                    </Badge>
                  )}
                  {anime.shikimori_rating && (
                    <Badge variant="secondary" className="bg-yellow-500/80 text-white">
                      Рейтинг: {anime.shikimori_rating}
                    </Badge>
                  )}
                </div>
                <p className="text-sm md:text-base text-gray-300 mb-6 line-clamp-3">{anime.description}</p>
                <Link href={`/anime/${anime.shikimori_id}`} passHref>
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Play className="mr-2 h-5 w-5" /> Смотреть
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 text-white" />
      <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 text-white" />
    </Carousel>
  )
}
