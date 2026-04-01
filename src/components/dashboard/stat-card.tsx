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
    <Card className={cn("border border-slate-200/50 shadow-sm transition-all duration-300 hover:shadow-md bg-white rounded-3xl overflow-hidden group", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">{title}</CardTitle>
        <div className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center transition-colors group-hover:bg-brand-indigo/5">
            <Icon className="h-4 w-4 text-brand-indigo/60 group-hover:text-brand-indigo transition-colors" />
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-2">
        <div className="text-3xl font-bold tracking-tight text-brand-indigo tabular-nums leading-none">{value}</div>
        {(description || trend) && (
            <div className="flex items-center text-[10px] text-slate-400 mt-4 tracking-wide font-medium">
                {trend && (
                    <span className={cn(
                        "mr-2 font-black px-2 py-0.5 rounded-lg text-[9px] uppercase tracking-widest",
                        trend.positive ? 'bg-teal-50 text-brand-teal' : 'bg-rose-50 text-rose-600'
                    )}>
                        {trend.positive ? '▲' : '▼'} {trend.value}%
                    </span>
                )}
                <span className="truncate opacity-60 font-semibold">{description || trend?.label}</span>
            </div>
        )}
      </CardContent>
    </Card>
  )
}
