"use client"

import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
}

export default function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  return (
    <Loader2 className={cn("animate-spin text-muted-foreground", sizeMap[size], className)} aria-label="Загрузка" />
  )
}
