import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function BlogPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  // Placeholder for blog posts
  const blogPosts = [
    {
      id: 1,
      title: 'Новые возможности AniHub!',
      description: 'Узнайте о последних обновлениях и функциях, которые мы добавили.',
      date: '2023-10-26',
      slug: 'new-features-anihub',
    },
    {
      id: 2,
      title: 'Топ-10 аниме осени 2023',
      description: 'Наш выбор лучших аниме, которые стоит посмотреть этой осенью.',
      date: '2023-10-20',
      slug: 'top-10-anime-fall-2023',
    },
    {
      id: 3,
      title: 'Как мы парсим данные для AniHub',
      description: 'Глубокое погружение в технические детали нашего парсера аниме.',
      date: '2023-10-15',
      slug: 'how-we-parse-data',
    },
  ]

  return (
    <main className="container mx-auto px-4 py-8 mt-16">
      <h1 className="text-3xl font-bold mb-8 text-center">Блог AniHub</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogPosts.map((post) => (
          <Card key={post.id}>
            <CardHeader>
              <CardTitle>{post.title}</CardTitle>
              <CardDescription>{post.date}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{post.description}</p>
              <Link href={`/blog/${post.slug}`} passHref>
                <Button variant="outline" className="w-full">Читать далее</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {!user && (
        <div className="mt-12 text-center">
          <p className="text-lg text-muted-foreground mb-4">
            Хотите получать уведомления о новых статьях?
          </p>
          <Link href="/register" passHref>
            <Button size="lg">Зарегистрироваться</Button>
          </Link>
        </div>
      )}
    </main>
  )
}
