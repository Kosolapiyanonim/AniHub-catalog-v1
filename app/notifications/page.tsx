import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotificationsPage() {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-4xl font-bold mb-8">Уведомления</h1>
      <p className="text-lg text-slate-300 mb-6">
        Здесь будут отображаться ваши последние уведомления.
      </p>
      <p className="text-slate-400 mb-8">
        Пока нет новых уведомлений.
      </p>
      <Button asChild>
        <Link href="/">На главную</Link>
      </Button>
    </div>
  );
}
