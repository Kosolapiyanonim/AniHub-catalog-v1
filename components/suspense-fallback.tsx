import { Skeleton } from "./ui/skeleton"

interface SuspenseFallbackProps {
  type?: "card" | "carousel" | "hero" | "list"
}

export function SuspenseFallback({ type = "card" }: SuspenseFallbackProps) {
  switch (type) {
    case "hero":
      return (
        <div className="h-[70vh] bg-slate-800 rounded-lg flex items-center justify-center">
          <Skeleton className="h-full w-full" />
        </div>
      )
    
    case "carousel":
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-[2/3] w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      )
    
    case "list":
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-[2/3] w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      )
    
    default:
      return (
        <div className="space-y-2">
          <Skeleton className="aspect-[2/3] w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      )
  }
} 