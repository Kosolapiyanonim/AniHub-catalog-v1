import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header"; // Убедитесь, что путь правильный
import { SupabaseProvider } from "@/components/supabase-provider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AniHub - Смотреть аниме онлайн",
  description: "Откройте для себя и смотрите свои любимые аниме-сериалы и фильмы",
    generator: 'v0.dev'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className="dark">
      <body className={inter.className}>
        {/* SupabaseProvider нужен для работы с данными пользователя в шапке */}
        <SupabaseProvider>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 pt-16"> {/* Добавляем отступ сверху, чтобы контент не уезжал под шапку */}
              {children}
            </main>
          </div>
          {/* Toaster нужен для всплывающих уведомлений (например, "Вы вышли из аккаунта") */}
          <Toaster />
        </SupabaseProvider>
      </body>
    </html>
  );
}
