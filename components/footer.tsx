"use client"

export function Footer() {
  return (
    <footer className="bg-card border-t border-border text-center py-6 text-sm text-muted-foreground">
      © {new Date().getFullYear()} AniHub. Все права защищены.
    </footer>
  )
}
