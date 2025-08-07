import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Play, ExternalLink } from 'lucide-react'

export default async function TikTokPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  // Placeholder for TikTok content
  const tiktokVideos = [
    {
      id: 1,
      thumbnail: '/placeholder.jpg?height=300&width=200&query=anime+tiktok+1',
      title: 'Лучшие моменты из аниме!',
      link: 'https://www.tiktok.com/@anihub_official',
    },
    {
      id: 2,
      thumbnail: '/placeholder.jpg?height=300&width=200&query=anime+tiktok+2',
      title: 'Аниме-тренды, которые вы должны знать.',
      link: 'https://www.tiktok.com/@anihub_official',
    },
    {
      id: 3,
      thumbnail: '/placeholder.jpg?height=300&width=200&query=anime+tiktok+3',
      title: 'Смешные моменты из аниме.',
      link: 'https://www.tiktok.com/@anihub_official',
    },
  ]

  return (
    <main className="container mx-auto px-4 py-8 mt-16">
      <h1 className="text-3xl font-bold mb-8 text-center flex items-center justify-center gap-2">
        <Play className="h-8 w-8" />
        Наш TikTok
      </h1>

      <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
        Смотрите наши короткие видео в TikTok с лучшими моментами, трендами и мемами из мира аниме!
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {tiktokVideos.map((video) => (
          <Card key={video.id}>
            <CardContent className="p-0">
              <img
                src={video.thumbnail || "/placeholder.svg"}
                alt={video.title}
                width={200}
                height={300}
                className="w-full h-auto object-cover rounded-t-lg aspect-[2/3]"
              />
              <div className="p-4">
                <p className="text-sm font-medium mb-3">{video.title}</p>
                <Link href={video.link} target="_blank" rel="noopener noreferrer" passHref>
                  <Button variant="outline" className="w-full">
                    Смотреть в TikTok
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link href="https://www.tiktok.com/@anihub_official" target="_blank" rel="noopener noreferrer" passHref>
          <Button size="lg">
            <Play className="mr-2 h-5 w-5" />
            Перейти в наш профиль
          </Button>
        </Link>
      </div>
    </main>
  )
}
