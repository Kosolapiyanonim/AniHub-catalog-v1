"use client"
import Link from 'next/link'
import Image from 'next/image'
import { Github, Instagram, Send, Youtube, Facebook, Twitter, Rss } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 py-8 mt-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <Image src="/placeholder-logo.svg" width={32} height={32} alt="AniHub Logo" />
            <span className="text-2xl font-bold text-white">AniHub</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            Ваш центральный хаб для просмотра и отслеживания аниме.
          </p>
        </div>

        <div className="col-span-1">
          <h3 className="text-lg font-semibold text-white mb-4">Навигация</h3>
          <ul className="space-y-2">
            <li><Link href="/catalog" className="text-muted-foreground hover:text-purple-400 transition-colors">Каталог</Link></li>
            <li><Link href="/popular" className="text-muted-foreground hover:text-purple-400 transition-colors">Популярное</Link></li>
            <li><Link href="/blog" className="text-muted-foreground hover:text-purple-400 transition-colors">Блог</Link></li>
            <li><Link href="/news" className="text-muted-foreground hover:text-purple-400 transition-colors">Новости</Link></li>
          </ul>
        </div>

        <div className="col-span-1">
          <h3 className="text-lg font-semibold text-white mb-4">Поддержка</h3>
          <ul className="space-y-2">
            <li><Link href="/faq" className="text-muted-foreground hover:text-purple-400 transition-colors">FAQ</Link></li>
            <li><Link href="/contact" className="text-muted-foreground hover:text-purple-400 transition-colors">Связаться с нами</Link></li>
            <li><Link href="/privacy" className="text-muted-foreground hover:text-purple-400 transition-colors">Политика конфиденциальности</Link></li>
            <li><Link href="/terms" className="text-muted-foreground hover:text-purple-400 transition-colors">Условия использования</Link></li>
          </ul>
        </div>

        <div className="col-span-1">
          <h3 className="text-lg font-semibold text-white mb-4">Мы в соцсетях</h3>
          <div className="flex space-x-4">
            <Link href="https://github.com/Kosolapiyanonim" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-purple-400 transition-colors">
              <Github className="h-6 w-6" />
              <span className="sr-only">GitHub</span>
            </Link>
            <Link href="/instagram" className="text-muted-foreground hover:text-purple-400 transition-colors">
              <Instagram className="h-6 w-6" />
              <span className="sr-only">Instagram</span>
            </Link>
            <Link href="/telegram" className="text-muted-foreground hover:text-purple-400 transition-colors">
              <Send className="h-6 w-6" />
              <span className="sr-only">Telegram</span>
            </Link>
            {/* Add more social links as needed */}
            {/*
            <Link href="#" className="text-muted-foreground hover:text-purple-400 transition-colors">
              <Youtube className="h-6 w-6" />
              <span className="sr-only">YouTube</span>
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-purple-400 transition-colors">
              <Facebook className="h-6 w-6" />
              <span className="sr-only">Facebook</span>
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-purple-400 transition-colors">
              <Twitter className="h-6 w-6" />
              <span className="sr-only">Twitter</span>
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-purple-400 transition-colors">
              <Rss className="h-6 w-6" />
              <span className="sr-only">RSS Feed</span>
            </Link>
            */}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground mt-8 border-t border-slate-800 pt-6">
        <p>&copy; {new Date().getFullYear()} AniHub. Все права защищены.</p>
        <p>Создано с ❤️ для любителей аниме.</p>
      </div>
    </footer>
  )
}
