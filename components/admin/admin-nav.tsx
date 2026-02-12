"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Film, 
  Users, 
  MessageSquare, 
  Settings, 
  Image as ImageIcon,
  BarChart3
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  {
    title: "Дашборд",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Аниме",
    href: "/admin/anime",
    icon: Film,
  },
  {
    title: "Пользователи",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Модерация",
    href: "/admin/moderate/comments",
    icon: MessageSquare,
  },
  {
    title: "Аналитика",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Настройки",
    href: "/admin/settings",
    icon: Settings,
  },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            )}
          >
            <Icon className="h-5 w-5" />
            <span>{item.title}</span>
          </Link>
        )
      })}
    </nav>
  )
}





