import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Newspaper } from 'lucide-react'

export default async function NewsPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  // Placeholder for news articles
  const newsArticles = [
    {
      id: 1,
      title: 'Анонсирован новый сезон "Атаки Титанов"',
      description: 'Подробности о дате выхода, студии и актерском составе.',
      date: '2023-11-01',
      slug: 'attack-on-titan-new-season',
    },
    {
      id: 2,
      title: 'Рекордные продажи манги "Магическая битва"',
      description: 'Манга Jujutsu Kaisen продолжает бить рекорды по продажам.',
      date: '2023-10-28',
      slug: 'jujutsu-kaisen-manga-sales',
    },
    {
      id: 3,
      title: 'Интервью с создателем "Человека-бензопилы"',
      description: 'Фуджимото Тацуки делится мыслями о своем творении.',
      date: '2023-10-25',
      slug: 'chainsaw-man-interview',
    },
  ]

  return (
    <main className="container mx-auto px-4 py-8 mt-16">
      <h1 className="text-3xl font-bold mb-8 text-center flex items-center justify-center gap-2">
        <Newspaper className="h-8 w-8" />
        Новости аниме
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {newsArticles.map((article) => (
          <Card key={article.id}>
            <CardHeader>
              <CardTitle>{article.title}</CardTitle>
              <CardDescription>{article.date}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{article.description}</p>
              <Link href={`/news/${article.slug}`} passHref>
                <Button variant="outline" className="w-full">Читать далее</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {!user && (
        <div className="mt-12 text-center">
          <p className="text-lg text-muted-foreground mb-4">
            Подпишитесь на нашу рассылку, чтобы не пропустить важные новости!
          </p>
          <Link href="/register" passHref>
            <Button size="lg">Зарегистрироваться</Button>
          </Link>
        </div>
      )}
    </main>
  )
}
