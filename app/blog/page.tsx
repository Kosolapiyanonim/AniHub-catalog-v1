import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function BlogPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Наш Блог</h1>
        <p className="text-lg text-center text-slate-300 mb-12">
          Здесь вы найдете последние новости, обзоры аниме, статьи о культуре и многое другое!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Placeholder for a blog post */}
          <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden">
            <img
              src="/placeholder.jpg?height=200&width=400&query=anime blog post"
              alt="Placeholder blog post image"
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2">Скоро новые посты!</h2>
              <p className="text-slate-400 text-sm mb-4">
                Мы активно работаем над созданием интересного контента для вас.
                Следите за обновлениями!
              </p>
              <Button asChild>
                <Link href="#">Читать далее</Link>
              </Button>
            </div>
          </div>

          {/* Another placeholder */}
          <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden">
            <img
              src="/placeholder.jpg?height=200&width=400&query=anime news article"
              alt="Placeholder news article image"
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2">Архив статей</h2>
              <p className="text-slate-400 text-sm mb-4">
                Пока здесь пусто, но скоро появятся увлекательные статьи и новости из мира аниме.
              </p>
              <Button asChild>
                <Link href="#">Посмотреть все</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <h3 className="text-2xl font-bold mb-4">Оставайтесь на связи!</h3>
          <p className="text-slate-300 mb-6">
            Подпишитесь на наши социальные сети, чтобы не пропустить новые публикации.
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="outline" asChild>
              <Link href="/telegram" target="_blank">Telegram</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/tiktok" target="_blank">TikTok</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/instagram" target="_blank">Instagram</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
