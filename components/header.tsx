"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Menu, X } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/catalog?search=${encodeURIComponent(searchQuery)}`)
      setSearchQuery("")
    }
  }

  return (
    <header className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-sm border-b border-slate-800 dark:border-slate-700 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-white hover:text-primary transition-colors">
            AnimeStream
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors">
              Главная
            </Link>
            <Link href="/catalog" className="text-gray-300 hover:text-white transition-colors">
              Каталог
            </Link>
            <Link href="/popular" className="text-gray-300 hover:text-white transition-colors">
              Популярное
            </Link>
          </nav>

          {/* Search & Theme Toggle */}
          <div className="hidden md:flex items-center space-x-2">
            <form onSubmit={handleSearch} className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Поиск аниме..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
              <Button type="submit" size="sm">
                <Search className="w-4 h-4" />
              </Button>
            </form>
            <ThemeToggle />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" className="text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800 dark:border-slate-700">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/"
                className="text-gray-300 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Главная
              </Link>
              <Link
                href="/catalog"
                className="text-gray-300 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Каталог
              </Link>
              <Link
                href="/popular"
                className="text-gray-300 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Популярное
              </Link>

              <form onSubmit={handleSearch} className="flex items-center space-x-2 pt-4">
                <Input
                  type="text"
                  placeholder="Поиск аниме..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="sm">
                  <Search className="w-4 h-4" />
                </Button>
              </form>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
