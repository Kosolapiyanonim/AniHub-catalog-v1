"use client"

export function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-center py-6 text-sm text-muted-foreground">
      © {new Date().getFullYear()} AniHub. Все права защищены.
    </footer>
  )
}
