import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, TrendingUp } from "lucide-react"

interface RankingItem {
  name: string
  subtext?: string
  value: string | number
  id?: string | number
  meta?: string
}

interface RankingListProps {
  title: string
  description?: string
  items: RankingItem[]
  type: 'pharmacy' | 'product'
}

export function RankingList({ title, description, items, type }: RankingListProps) {
  // Calculate max value for relative bar scaling
  const maxVal = Math.max(
    ...items.map((item) => {
      if (typeof item.value === 'number') return item.value;
      const numMatch = String(item.value).match(/\d+(\.\d+)?/);
      return numMatch ? parseFloat(numMatch[0]) : 0;
    }),
    1 // fall back to 1 to avoid division by zero
  );

  return (
    <Card className="border border-slate-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] transition-all duration-200 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06)] hover:scale-[1.01] bg-card overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-[0.75rem] font-semibold uppercase tracking-[0.05em] text-slate-500 flex items-center gap-2">
              {type === 'pharmacy' ? (
                <Trophy className="h-3.5 w-3.5 text-amber-500" />
              ) : (
                <TrendingUp className="h-3.5 w-3.5 text-brand-teal" />
              )}
              {title}
            </CardTitle>
            {description && <CardDescription className="text-[0.65rem] opacity-80">{description}</CardDescription>}
          </div>
          <Badge variant="outline" className="bg-slate-50 border-slate-200 text-slate-500 text-[9px] uppercase tracking-wider font-bold px-2 py-0 h-5">
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <div className="space-y-1">
          {items.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">No performance data yet.</p>
          ) : (
            items.slice(0, 5).map((item, idx) => {
              const currentVal = typeof item.value === 'number' 
                ? item.value 
                : parseFloat(String(item.value).match(/\d+(\.\d+)?/)?.[0] || '0');
              const barWidth = Math.min((currentVal / maxVal) * 100, 100);

              return (
                <div key={idx} className="relative group px-6 py-2.5 transition-colors hover:bg-slate-50/50">
                  {/* Performance Bar Background */}
                  <div 
                    className="absolute inset-y-0 left-0 bg-slate-100/50 transition-all duration-700" 
                    style={{ width: `${barWidth}%` }}
                  />
                  <div 
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" 
                  />

                  <div className="relative flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="text-[11px] font-mono font-bold text-slate-400 w-4 grayscale hover:grayscale-0 transition-all">
                        0{idx + 1}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-bold text-brand-indigo truncate" title={item.name}>
                            {item.name}
                          </span>
                          {idx === 0 && (
                            <Badge className="bg-emerald-50 text-emerald-600 border-0 text-[8px] tracking-wide font-black h-4 px-1.5 rounded-sm">
                              TOP
                            </Badge>
                          )}
                          {type === 'product' && currentVal > (maxVal * 0.7) && idx > 0 && (
                            <Badge className="bg-slate-100 text-slate-600 border-0 text-[8px] tracking-wide font-black h-4 px-1.5 rounded-sm">
                              VELOCITY
                            </Badge>
                          )}
                        </div>
                        {item.subtext && (
                          <span className="text-[10px] text-slate-500 truncate mt-0.5">
                            {item.subtext}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-[13px] font-bold font-mono tracking-tight text-brand-indigo tabular-nums">
                        {item.value}
                      </span>
                      {item.meta && (
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                          {item.meta}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
