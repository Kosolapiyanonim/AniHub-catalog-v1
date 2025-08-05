import Link from "next/link"

export function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
              Откройте для себя мир аниме
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-200 md:text-xl">
              Смотрите любимые аниме сериалы и фильмы в высоком качестве, где угодно и когда угодно.
            </p>
          </div>
          <div className="space-x-4">
            <Link
              href="/catalog"
              className="inline-flex h-9 items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-purple-600 shadow transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50"
              prefetch={false}
            >
              Начать просмотр
            </Link>
            <Link
              href="#"
              className="inline-flex h-9 items-center justify-center rounded-md border border-white bg-transparent px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white disabled:pointer-events-none disabled:opacity-50"
              prefetch={false}
            >
              Узнать больше
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
