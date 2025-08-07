import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Instagram, ExternalLink } from 'lucide-react'

export default async function InstagramPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  // Placeholder for Instagram content
  const instagramPosts = [
    {
      id: 1,
      image: '/placeholder.jpg?height=300&width=300&query=anime+art+1',
      caption: 'Новый арт по вашему любимому аниме!',
      link: 'https://instagram.com/anihub_official',
    },
    {
      id: 2,
      image: '/placeholder.jpg?height=300&width=300&query=anime+art+2',
      caption: 'Загляните за кулисы создания AniHub!',
      link: 'https://instagram.com/anihub_official',
    },
    {
      id: 3,
      image: '/placeholder.jpg?height=300&width=300&query=anime+art+3',
      caption: 'Ежедневная доза милоты из мира аниме.',
      link: 'https://instagram.com/anihub_official',
    },
  ]

  return (
    <main className="container mx-auto px-4 py-8 mt-16">
      <h1 className="text-3xl font-bold mb-8 text-center flex items-center justify-center gap-2">
        <Instagram className="h-8 w-8 text-pink-500" />
        Наш Instagram
      </h1>

      <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
        Следите за нами в Instagram, чтобы быть в курсе последних новостей, артов и эксклюзивного контента из мира аниме!
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {instagramPosts.map((post) => (
          <Card key={post.id}>
            <CardContent className="p-0">
              <img
                src={post.image || "/placeholder.svg"}
                alt={post.caption}
                width={300}
                height={300}
                className="w-full h-auto object-cover rounded-t-lg"
              />
              <div className="p-4">
                <p className="text-sm text-muted-foreground mb-3">{post.caption}</p>
                <Link href={post.link} target="_blank" rel="noopener noreferrer" passHref>
                  <Button variant="outline" className="w-full">
                    Посмотреть в Instagram
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link href="https://instagram.com/anihub_official" target="_blank" rel="noopener noreferrer" passHref>
          <Button size="lg">
            <Instagram className="mr-2 h-5 w-5" />
            Перейти в наш профиль
          </Button>
        </Link>
      </div>
    </main>
  )
}
