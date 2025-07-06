import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">AnimeSite</h3>
            <p className="text-muted-foreground">Лучшая платформа для просмотра аниме онлайн в высоком качестве.</p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Навигация</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground">
                  Главная
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="hover:text-foreground">
                  Каталог
                </Link>
              </li>
              <li>
                <Link href="/genres" className="hover:text-foreground">
                  Жанры
                </Link>
              </li>
              <li>
                <Link href="/random" className="hover:text-foreground">
                  Случайное
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Жанры</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/genres/action" className="hover:text-foreground">
                  Боевик
                </Link>
              </li>
              <li>
                <Link href="/genres/romance" className="hover:text-foreground">
                  Романтика
                </Link>
              </li>
              <li>
                <Link href="/genres/comedy" className="hover:text-foreground">
                  Комедия
                </Link>
              </li>
              <li>
                <Link href="/genres/drama" className="hover:text-foreground">
                  Драма
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Информация</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-foreground">
                  О нас
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground">
                  Контакты
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground">
                  Конфиденциальность
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground">
                  Условия
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} AnimeSite. Все права защищены.</p>
        </div>
      </div>
    </footer>
  )
}
