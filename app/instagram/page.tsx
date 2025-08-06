import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function InstagramPage() {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-4xl font-bold mb-8">Наш Instagram</h1>
      <p className="text-lg text-slate-300 mb-6">
        Следите за нами в Instagram, чтобы видеть красивые арты, новости и эксклюзивный контент!
      </p>
      <Button asChild size="lg">
        <Link href="https://www.instagram.com/your_instagram_account" target="_blank" rel="noopener noreferrer">
          Перейти в Instagram
        </Link>
      </Button>
      <p className="text-slate-400 mt-8">
        (Это заглушка. Замените ссылку на ваш реальный Instagram-аккаунт.)
      </p>
    </div>
  );
}
