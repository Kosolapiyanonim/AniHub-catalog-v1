import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default async function RegisterPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/')
  }

  const handleSignUp = async (formData: FormData) => {
    'use server'
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string
    const supabase = createServerComponentClient({ cookies })

    if (password !== confirmPassword) {
      toast.error('Пароли не совпадают.')
      return redirect('/register?message=Passwords do not match')
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })

    if (error) {
      console.error('Sign up error:', error)
      toast.error(error.message || 'Ошибка регистрации. Попробуйте еще раз.')
      return redirect('/register?message=Could not register user')
    }

    toast.success('Регистрация успешна! Проверьте свою почту для подтверждения.')
    return redirect('/register?message=Check email to continue sign in process')
  }

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    'use server'
    const supabase = createServerComponentClient({ cookies })
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })

    if (error) {
      console.error('OAuth sign-up error:', error)
      toast.error(error.message || 'Ошибка регистрации через OAuth.')
      return redirect('/register?message=Could not register with OAuth')
    }

    if (data.url) {
      return redirect(data.url)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Зарегистрироваться в AniHub</CardTitle>
          <CardDescription>
            Создайте аккаунт, чтобы начать отслеживать аниме.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSignUp} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="ваша@почта.com" required />
            </div>
            <div>
              <Label htmlFor="password">Пароль</Label>
              <Input id="password" name="password" type="password" placeholder="••••••••" required />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••••" required />
            </div>
            <Button type="submit" className="w-full">Зарегистрироваться</Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Или зарегистрироваться с
              </span>
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <form action={handleOAuthSignIn.bind(null, 'google')}>
              <Button type="submit" variant="outline" className="w-full">
                Зарегистрироваться с Google
              </Button>
            </form>
            <form action={handleOAuthSignIn.bind(null, 'github')}>
              <Button type="submit" variant="outline" className="w-full">
                Зарегистрироваться с GitHub
              </Button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Уже есть аккаунт?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Войти
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
