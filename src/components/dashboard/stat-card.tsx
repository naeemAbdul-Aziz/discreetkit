import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: {
    value: number
    label: string
    positive?: boolean
  }
  className?: string
}

export function StatCard({ title, value, icon: Icon, description, trend, className }: StatCardProps) {
  return (
    <Card className={cn("border border-slate-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] transition-all duration-200 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06)] hover:scale-[1.01] bg-card", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-[0.75rem] uppercase tracking-[0.05em] font-semibold text-slate-500">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
            <Icon className="h-4 w-4 text-brand-indigo" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight text-brand-indigo tabular-nums">{value}</div>
        {(description || trend) && (
            <div className="flex items-center text-[0.65rem] text-muted-foreground mt-1 tracking-wide">
                {trend && (
                    <span className={cn(
                        "mr-2 font-semibold px-1.5 py-0.5 rounded text-[0.65rem]",
                        trend.positive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    )}>
                        {trend.positive ? '+' : ''}{trend.value}%
                    </span>
                )}
                <span className="truncate opacity-80">{description || trend?.label}</span>
            </div>
        )}
      </CardContent>
    </Card>
  )
}
