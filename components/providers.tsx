'use client';

import type React from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { SupabaseProvider } from "@/components/supabase-provider";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  // Здесь мы собираем все провайдеры, которым нужен 'use client'
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <SupabaseProvider>
        {children}
        <Toaster />
      </SupabaseProvider>
    </ThemeProvider>
  );
}
