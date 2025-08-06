import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function FavoritesPage() {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-4xl font-bold mb-8">Мои Закладки</h1>
      <p className="text-lg text-slate-300 mb-6">
        Здесь будут отображаться аниме, которые вы добавили в закладки.
      </p>
      <p className="text-slate-400 mb-8">
        Войдите или зарегистрируйтесь, чтобы начать добавлять аниме в избранное!
      </p>
      <Button asChild size="lg">
        <Link href="/login">Войти / Зарегистрироваться</Link>
      </Button>
    </div>
  );
}
