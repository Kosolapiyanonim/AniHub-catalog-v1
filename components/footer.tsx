import Link from "next/link"
import Image from "next/image"
import { Github, Twitter, Youtube } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-background py-8">
      <div className="container flex flex-col items-center justify-between gap-6 px-4 md:flex-row md:px-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center" prefetch={false}>
            <Image src="/placeholder-logo.svg" width={32} height={32} alt="AniHub Logo" />
            <span className="font-bold text-lg ml-2">AniHub</span>
          </Link>
          <p className="text-sm text-muted-foreground">© 2024 AniHub. Все права защищены.</p>
        </div>
        <nav className="flex flex-wrap justify-center gap-4 text-sm font-medium md:gap-6">
          <Link href="/about" className="hover:text-primary" prefetch={false}>
            О нас
          </Link>
          <Link href="/contact" className="hover:text-primary" prefetch={false}>
            Контакты
          </Link>
          <Link href="/privacy" className="hover:text-primary" prefetch={false}>
            Политика конфиденциальности
          </Link>
          <Link href="/terms" className="hover:text-primary" prefetch={false}>
            Условия использования
          </Link>
        </nav>
        <div className="flex gap-4">
          <Link href="#" className="text-muted-foreground hover:text-primary" prefetch={false}>
            <Twitter className="h-5 w-5" />
            <span className="sr-only">Twitter</span>
          </Link>
          <Link href="#" className="text-muted-foreground hover:text-primary" prefetch={false}>
            <Github className="h-5 w-5" />
            <span className="sr-only">GitHub</span>
          </Link>
          <Link href="#" className="text-muted-foreground hover:text-primary" prefetch={false}>
            <Youtube className="h-5 w-5" />
            <span className="sr-only">YouTube</span>
          </Link>
        </div>
      </div>
    </footer>
  )
}
