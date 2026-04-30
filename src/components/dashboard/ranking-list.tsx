import { Badge } from "@/components/ui/badge"
import { Trophy, TrendingUp, Activity, ShieldCheck, Network, Zap, Terminal } from "lucide-react"
import { cn } from "@/lib/utils"

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
  className?: string
}

export function RankingList({ title, description, items, type, className }: RankingListProps) {
  const maxVal = Math.max(
    ...items.map((item) => {
      if (typeof item.value === 'number') return item.value;
      const numMatch = String(item.value).match(/\d+(\.\d+)?/);
      return numMatch ? parseFloat(numMatch[0]) : 0;
    }),
    1
  );

  return (
    <div className={cn("space-y-16", className)}>
      {title && (
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-6">
             {type === 'pharmacy' ? (
                <Network className="h-8 w-8 text-slate-300" />
              ) : (
                <ShieldCheck className="h-8 w-8 text-slate-300" />
              )}
             <h4 className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-900">{title}</h4>
          </div>
          <div className="h-10 px-8 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-black uppercase tracking-[0.3em] flex items-center shadow-sm">
            LIVE_OPERATIONAL_TELEMETRY
          </div>
        </div>
      )}
      
      <div className="space-y-6">
        {items.length === 0 ? (
          <div className="py-60 text-center rounded-[40px] border border-slate-50 bg-slate-50/20">
            <p className="text-[12px] font-black text-slate-300 uppercase tracking-[0.4em] leading-none">PROTOCOL_NOMINAL: NO_RECORDS_MAPPED</p>
          </div>
        ) : (
          items.slice(0, 6).map((item, idx) => {
            const currentVal = typeof item.value === 'number' 
              ? item.value 
              : parseFloat(String(item.value).match(/\d+(\.\d+)?/)?.[0] || '0');
            const barWidth = Math.min((currentVal / maxVal) * 100, 100);

            return (
              <div key={idx} className="relative group p-12 rounded-[32px] border border-transparent hover:border-slate-50 hover:bg-slate-50/30 transition-none overflow-hidden">
                {/* Performance Visualizer */}
                <div 
                  className="absolute inset-y-0 left-0 bg-slate-50/50 transition-none z-0" 
                  style={{ width: `${barWidth}%` }}
                />
                
                <div className="relative flex items-center justify-between gap-12 z-10">
                  <div className="flex items-center gap-10 min-w-0">
                    <span className="text-[14px] font-black text-slate-200 w-12 flex-shrink-0 tabular-nums">
                      {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                    </span>
                    <div className="flex flex-col min-w-0 gap-6">
                      <div className="flex items-center gap-8">
                        <span className="text-base font-black text-slate-900 uppercase tracking-tight truncate leading-none" title={item.name}>
                          {item.name}
                        </span>
                        {idx === 0 && (
                          <div className="h-9 px-6 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center border border-slate-800 shadow-2xl shadow-slate-900/10">
                            ALPHA_NODE
                          </div>
                        )}
                        {type === 'product' && currentVal > (maxVal * 0.7) && idx > 0 && (
                          <div className="h-9 px-6 rounded-full bg-brand-teal text-white text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 shadow-2xl shadow-brand-teal/10">
                            <Zap className="h-4 w-4" />
                            HIGH_PULSE
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-6">
                          <Terminal className="h-5 w-5 text-slate-200" />
                          <span className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em] leading-none">
                            {item.subtext?.toUpperCase() || `OPERATIONAL_STATION_INDEX_${1000 + idx}`}
                          </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end shrink-0 gap-4">
                    <span className="text-xl font-black text-slate-900 tabular-nums tracking-[0.2em] uppercase leading-none">
                      {item.value}
                    </span>
                    {item.meta && (
                      <div className="flex items-center gap-4">
                        <div className="h-1 w-6 bg-slate-100 rounded-full" />
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">
                            {item.meta.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
