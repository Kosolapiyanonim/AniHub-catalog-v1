import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { SubscribeButton } from "./SubscribeButton"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-8 md:py-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/placeholder-logo.svg" width={40} height={40} alt="AniHub Logo" />
            <span className="text-2xl font-bold text-white">AniHub</span>
          </Link>
          <p className="text-sm">
            Смотрите любимое аниме онлайн бесплатно в высоком качестве. Большая коллекция аниме сериалов и фильмов.
          </p>
          <div className="flex space-x-4">
            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
              <FacebookIcon className="h-6 w-6" />
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
              <TwitterIcon className="h-6 w-6" />
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
              <InstagramIcon className="h-6 w-6" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Навигация</h3>
            <nav className="space-y-2">
              <Link href="/" className="text-sm hover:text-white transition-colors block">
                Главная
              </Link>
              <Link href="/catalog" className="text-sm hover:text-white transition-colors block">
                Каталог
              </Link>
              <Link href="/popular" className="text-sm hover:text-white transition-colors block">
                Популярное
              </Link>
              <Link href="#" className="text-sm hover:text-white transition-colors block">
                Новинки
              </Link>
            </nav>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Помощь</h3>
            <nav className="space-y-2">
              <Link href="#" className="text-sm hover:text-white transition-colors block">
                FAQ
              </Link>
              <Link href="#" className="text-sm hover:text-white transition-colors block">
                Контакты
              </Link>
              <Link href="#" className="text-sm hover:text-white transition-colors block">
                Политика конфиденциальности
              </Link>
              <Link href="#" className="text-sm hover:text-white transition-colors block">
                Условия использования
              </Link>
            </nav>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white mb-4">Подпишитесь на рассылку</h3>
          <p className="text-sm">Получайте последние новости и обновления прямо на вашу почту.</p>
          <SubscribeButton />
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} AniHub. Все права защищены.
      </div>
    </footer>
  )
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function TwitterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  )
}
