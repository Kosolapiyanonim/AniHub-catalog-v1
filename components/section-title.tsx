import type React from "react"

interface SectionTitleProps {
  title: string
  icon?: React.ReactNode
}

export function SectionTitle({ title, icon }: SectionTitleProps) {
  return (
    <div className="flex items-center gap-3 mb-4">
      {icon && <div className="text-primary">{icon}</div>}
      <h2 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h2>
    </div>
  )
}
