import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function TelegramPage() {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-4xl font-bold mb-8">Наш Telegram-канал</h1>
      <p className="text-lg text-slate-300 mb-6">
        Присоединяйтесь к нашему Telegram-каналу, чтобы быть в курсе всех новостей и обновлений!
      </p>
      <Button asChild size="lg">
        <Link href="https://t.me/your_telegram_channel" target="_blank" rel="noopener noreferrer">
          Перейти в Telegram
        </Link>
      </Button>
      <p className="text-slate-400 mt-8">
        (Это заглушка. Замените ссылку на ваш реальный Telegram-канал.)
      </p>
    </div>
  );
}
