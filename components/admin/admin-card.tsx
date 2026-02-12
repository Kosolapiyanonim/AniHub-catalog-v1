import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface AdminCardProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export function AdminCard({ 
  title, 
  value, 
  description, 
  icon, 
  trend,
  className 
}: AdminCardProps) {
  return (
    <Card className={cn("bg-slate-800 border-slate-700", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-400">
          {title}
        </CardTitle>
        {icon && <div className="text-slate-400">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
        {description && (
          <p className="text-xs text-slate-400 mt-1">{description}</p>
        )}
        {trend && (
          <p className={cn(
            "text-xs mt-1",
            trend.isPositive ? "text-green-400" : "text-red-400"
          )}>
            {trend.isPositive ? "+" : ""}{trend.value}% от прошлого периода
          </p>
        )}
      </CardContent>
    </Card>
  )
}





