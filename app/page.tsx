import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { HeroSection } from '@/components/hero-section'
import { AnimeCarousel } from '@/components/AnimeCarousel'
import { getHomepageSections } from '@/lib/data-fetchers'
import Image from 'next/image'

export default async function HomePage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  const homepageSections = await getHomepageSections()

  return (
    <main className="flex min-h-screen flex-col items-center justify-between pt-16">
      <HeroSection />

      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Исследуйте мир аниме</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Откройте для себя новые сериалы, отслеживайте свой прогресс и общайтесь с другими фанатами.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/catalog" passHref>
                <Button size="lg">Перейти в каталог</Button>
              </Link>
              {!user && (
                <Link href="/register" passHref>
                  <Button variant="outline" size="lg">Зарегистрироваться</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {homepageSections.map((section) => (
        <section key={section.id} className="w-full py-8">
          <div className="container px-4 md:px-6">
            <h2 className="text-2xl font-bold mb-6">{section.title}</h2>
            {section.type === 'carousel' && (
              <AnimeCarousel animes={section.animes} user={user} />
            )}
            {section.type === 'grid' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {section.animes.map((anime) => (
                  <div key={anime.id} className="aspect-[2/3] rounded-lg overflow-hidden">
                    <Image
                      src={anime.poster_url || '/placeholder.svg?height=300&width=200&text=No+Poster'}
                      alt={anime.title}
                      width={200}
                      height={300}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      ))}
    </main>
  )
}
