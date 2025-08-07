import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Send, ExternalLink } from 'lucide-react'

export default async function TelegramPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <main className="container mx-auto px-4 py-8 mt-16">
      <h1 className="text-3xl font-bold mb-8 text-center flex items-center justify-center gap-2">
        <Send className="h-8 w-8 text-blue-400" />
        Наш Telegram-канал
      </h1>

      <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
        Присоединяйтесь к нашему Telegram-каналу, чтобы получать мгновенные уведомления о новых сериях, новостях и обновлениях AniHub!
      </p>

      <Card className="w-full max-w-md mx-auto text-center">
        <CardHeader>
          <CardTitle>Подпишитесь на наш канал</CardTitle>
          <CardDescription>
            Будьте в курсе всех событий в мире аниме.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Мы публикуем анонсы новых релизов, интересные факты и многое другое.
          </p>
          <Link href="https://t.me/anihub_official" target="_blank" rel="noopener noreferrer" passHref>
            <Button size="lg" className="w-full">
              <Send className="mr-2 h-5 w-5" />
              Перейти в Telegram
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {!user && (
        <div className="mt-12 text-center">
          <p className="text-lg text-muted-foreground mb-4">
            Хотите получать персонализированные уведомления?
          </p>
          <Link href="/register" passHref>
            <Button size="lg">Зарегистрироваться</Button>
          </Link>
        </div>
      )}
    </main>
  )
}
