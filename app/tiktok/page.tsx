import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function TikTokPage() {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-4xl font-bold mb-8">Наш TikTok</h1>
      <p className="text-lg text-slate-300 mb-6">
        Подписывайтесь на наш TikTok, чтобы смотреть короткие видео и моменты из любимых аниме!
      </p>
      <Button asChild size="lg">
        <Link href="https://www.tiktok.com/@your_tiktok_account" target="_blank" rel="noopener noreferrer">
          Перейти в TikTok
        </Link>
      </Button>
      <p className="text-slate-400 mt-8">
        (Это заглушка. Замените ссылку на ваш реальный TikTok-аккаунт.)
      </p>
    </div>
  );
}
