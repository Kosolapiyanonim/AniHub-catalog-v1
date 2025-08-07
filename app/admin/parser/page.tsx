import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default async function ParserPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const handleParseLatest = async () => {
    'use server'
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/parse-latest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()
      if (response.ok) {
        toast.success(data.message || 'Последние аниме успешно спарсены!')
      } else {
        toast.error(data.error || 'Ошибка при парсинге последних аниме.')
      }
    } catch (error) {
      console.error('Error parsing latest anime:', error)
      toast.error('Произошла ошибка при парсинге последних аниме.')
    }
  }

  const handleParseSinglePage = async (formData: FormData) => {
    'use server'
    const page = formData.get('page')
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/parse-single-page`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ page: Number(page) }),
      })
      const data = await response.json()
      if (response.ok) {
        toast.success(data.message || `Страница ${page} успешно спарсена!`)
      } else {
        toast.error(data.error || `Ошибка при парсинге страницы ${page}.`)
      }
    } catch (error) {
      console.error('Error parsing single page:', error)
      toast.error('Произошла ошибка при парсинге страницы.')
    }
  }

  const handleFullParse = async () => {
    'use server'
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/full-parser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()
      if (response.ok) {
        toast.success(data.message || 'Полный парсинг запущен успешно!')
      } else {
        toast.error(data.error || 'Ошибка при запуске полного парсинга.')
      }
    } catch (error) {
      console.error('Error starting full parse:', error)
      toast.error('Произошла ошибка при запуске полного парсинга.')
    }
  }

  return (
    <main className="container mx-auto px-4 py-8 mt-16">
      <h1 className="text-3xl font-bold mb-8 text-center">Панель управления парсером</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Парсинг последних аниме</CardTitle>
            <CardDescription>
              Запускает парсинг последних добавленных аниме с Kodik.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleParseLatest}>
              <Button type="submit" className="w-full">Запустить парсинг последних</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Парсинг одной страницы</CardTitle>
            <CardDescription>
              Парсит аниме с указанной страницы Kodik.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleParseSinglePage} className="space-y-4">
              <div>
                <Label htmlFor="page-number">Номер страницы</Label>
                <Input id="page-number" name="page" type="number" defaultValue={1} min={1} required />
              </div>
              <Button type="submit" className="w-full">Запустить парсинг страницы</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Полный парсинг</CardTitle>
            <CardDescription>
              Запускает полный парсинг всех аниме с Kodik (может занять много времени).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleFullParse}>
              <Button type="submit" className="w-full" variant="destructive">Запустить полный парсинг</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
