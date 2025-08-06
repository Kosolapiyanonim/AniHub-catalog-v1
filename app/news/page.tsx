import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NewsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Новости Аниме</h1>
        <p className="text-lg text-center text-slate-300 mb-12">
          Будьте в курсе последних событий, анонсов и трейлеров из мира аниме.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Placeholder for a news item */}
          <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden">
            <img
              src="/placeholder.jpg?height=200&width=400&query=anime news update"
              alt="Placeholder news image"
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2">Свежие новости скоро!</h2>
              <p className="text-slate-400 text-sm mb-4">
                Мы готовим для вас самые актуальные новости и обзоры.
                Оставайтесь с нами!
              </p>
              <Button asChild>
                <Link href="#">Подробнее</Link>
              </Button>
            </div>
          </div>

          {/* Another placeholder */}
          <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden">
            <img
              src="/placeholder.jpg?height=200&width=400&query=anime event announcement"
              alt="Placeholder event image"
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2">Анонсы событий</h2>
              <p className="text-slate-400 text-sm mb-4">
                Здесь будут публиковаться анонсы предстоящих аниме-событий и фестивалей.
              </p>
              <Button asChild>
                <Link href="#">Узнать больше</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <h3 className="text-2xl font-bold mb-4">Не пропустите!</h3>
          <p className="text-slate-300 mb-6">
            Подпишитесь на нашу рассылку, чтобы получать новости прямо на почту.
          </p>
          <Button>Подписаться</Button>
        </div>
      </div>
    </div>
  );
}
