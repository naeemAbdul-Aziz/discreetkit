import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon, Activity, Zap } from "lucide-react"
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
    <Card
      className={cn(
        "border border-slate-100 bg-white rounded-[40px] transition-none overflow-hidden group/card shadow-2xl shadow-slate-900/5",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-16 pb-10">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-6">
            <div className="h-3 w-3 rounded-full bg-brand-teal shadow-[0_0_12px_rgba(20,184,166,0.6)]" />
            <CardTitle className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-400 leading-none">{title}</CardTitle>
          </div>
          <div className="flex items-center gap-4 pl-9">
              <div className="h-1 w-6 bg-slate-50 rounded-full" />
              <p className="text-[10px] font-black text-slate-200 uppercase tracking-widest leading-none">{description || "LIVE_OPERATIONAL_STREAM"}</p>
          </div>
        </div>
        <div className="h-20 w-20 rounded-[32px] bg-slate-900 flex items-center justify-center transition-none border border-slate-800 shadow-2xl shadow-slate-900/40 group-hover/card:scale-110 duration-500">
          <Icon className="h-10 w-10 text-brand-teal" />
        </div>
      </CardHeader>
      <CardContent className="p-16 pt-6">
        <div className="text-6xl font-black tracking-tighter text-slate-900 tabular-nums leading-none uppercase">{value}</div>
        {trend ? (
            <div className="flex items-center gap-6 mt-16">
                <div className={cn(
                    "flex items-center gap-4 px-8 py-3.5 rounded-full text-[11px] font-black uppercase tracking-widest border transition-none shadow-sm",
                    trend.positive 
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                )}>
                    {trend.positive ? '↑' : '↓'} {trend.value}%
                </div>
                <span className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em]">{trend.label.toUpperCase()}</span>
            </div>
        ) : (
            <div className="flex items-center gap-8 mt-16">
                 <div className="flex items-center gap-4">
                    <Zap className="h-4 w-4 text-brand-teal animate-pulse" />
                    <span className="text-[11px] font-black text-slate-100 uppercase tracking-[0.3em] leading-none">TELEMETRY_SYNC_NOMINAL</span>
                 </div>
            </div>
        )}
      </CardContent>
    </Card>
  )
}
