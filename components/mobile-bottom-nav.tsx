"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Compass, Star, Bell, Menu } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { MobileMenuContent } from "@/components/mobile-menu-content"
import { useState } from "react"

export function MobileBottomNav() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { href: "/", icon: Home, label: "Главная" },
    { href: "/catalog", icon: Compass, label: "Каталог" },
    { href: "/favorites", icon: Star, label: "Избранное" },
    { href: "/notifications", icon: Bell, label: "Уведомления" },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <nav className="flex h-14 items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Button
              key={item.href}
              variant="ghost"
              size="icon"
              asChild
              className={`flex flex-col h-auto w-auto p-2 text-xs ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Link href={item.href}>
                <item.icon className="h-5 w-5 mb-1" />
                <span>{item.label}</span>
              </Link>
            </Button>
          )
        })}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="flex flex-col h-auto w-auto p-2 text-xs text-muted-foreground"
            >
              <Menu className="h-5 w-5 mb-1" />
              <span>Меню</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <MobileMenuContent setMobileMenuOpen={setMobileMenuOpen} />
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  )
}
