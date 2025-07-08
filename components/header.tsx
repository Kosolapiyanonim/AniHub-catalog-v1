"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, Menu, X, Bell, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SearchDialog } from "./search-dialog"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Логотип */}
            <div className="flex-shrink-0 mr-12">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <span className="text-xl font-bold text-white">AniHub</span>
              </Link>
            </div>

            {/* Центральная навигация */}
            <div className="hidden lg:flex flex-1 max-w-4xl mx-8 items-center justify-center space-x-8">
              <nav className="flex items-center space-x-8">
                <Link href="/" className="text-gray-300 hover:text-white transition-colors duration-200 font-medium">
                  Главная
                </Link>

                {/* Поиск */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    onClick={() => setIsSearchOpen(true)}
                    className="text-gray-300 hover:text-white hover:bg-slate-800 transition-colors duration-200 font-medium px-4 py-2"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Поиск
                  </Button>
                </div>

                <Link
                  href="/catalog"
                  className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
                >
                  Каталог
                </Link>
              </nav>
            </div>

            {/* Правая часть */}
            <div className="hidden lg:flex items-center space-x-4 flex-shrink-0 ml-12">
              {/* Уведомления */}
              <Button
                variant="ghost"
                size="sm"
                className="relative text-gray-300 hover:text-white hover:bg-slate-800 transition-colors duration-200"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </Button>

              {/* Аватарка профиля */}
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-white hover:bg-slate-800 transition-colors duration-200"
              >
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
              </Button>

              {/* Бургер меню */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-300 hover:text-white hover:bg-slate-800 transition-colors duration-200"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>

            {/* Мобильное меню кнопка */}
            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-300 hover:text-white"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>

          {/* Мобильное выпадающее меню */}
          {isMenuOpen && (
            <div className="lg:hidden border-t border-slate-800 bg-slate-900">
              <div className="px-4 py-4 space-y-4">
                <Link
                  href="/"
                  className="block text-gray-300 hover:text-white transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Главная
                </Link>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsSearchOpen(true)
                    setIsMenuOpen(false)
                  }}
                  className="w-full justify-start text-gray-300 hover:text-white hover:bg-slate-800 transition-colors duration-200"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Поиск
                </Button>
                <Link
                  href="/catalog"
                  className="block text-gray-300 hover:text-white transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Каталог
                </Link>
                <div className="border-t border-slate-800 pt-4 space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-300 hover:text-white hover:bg-slate-800 transition-colors duration-200"
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Уведомления
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-300 hover:text-white hover:bg-slate-800 transition-colors duration-200"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Профиль
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Поисковый диалог */}
      <SearchDialog isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}
