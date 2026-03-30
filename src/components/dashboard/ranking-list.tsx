
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
    <Card className="border-0 shadow-sm bg-card/50 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-2">
              {type === 'pharmacy' ? (
                <Trophy className="h-3.5 w-3.5 text-amber-500" />
              ) : (
                <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
              )}
              {title}
            </CardTitle>
            {description && <CardDescription className="text-xs">{description}</CardDescription>}
          </div>
          <Badge variant="outline" className="bg-background/50 border-border/10 text-[10px] font-bold px-2 py-0 h-5">
            Realtime
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
                <div key={idx} className="relative group px-6 py-2.5 transition-colors hover:bg-muted/30">
                  {/* Performance Bar Background */}
                  <div 
                    className="absolute inset-y-0 left-0 bg-primary/[0.03] transition-all duration-700" 
                    style={{ width: `${barWidth}%` }}
                  />
                  <div 
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity" 
                  />

                  <div className="relative flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="text-[11px] font-mono font-bold text-muted-foreground/40 w-4 grayscale hover:grayscale-0 transition-all">
                        0{idx + 1}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-bold text-foreground truncate" title={item.name}>
                            {item.name}
                          </span>
                          {idx === 0 && (
                            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0 text-[9px] font-black h-4 px-1.5 rounded-sm">
                              TOP
                            </Badge>
                          )}
                          {type === 'product' && currentVal > (maxVal * 0.7) && idx > 0 && (
                            <Badge className="bg-blue-500/10 text-blue-500 border-0 text-[9px] font-black h-4 px-1.5 rounded-sm">
                              VELOCITY
                            </Badge>
                          )}
                        </div>
                        {item.subtext && (
                          <span className="text-[10px] text-muted-foreground/70 truncate mt-0.5">
                            {item.subtext}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-[13px] font-black font-mono tracking-tight text-primary">
                        {item.value}
                      </span>
                      {item.meta && (
                        <span className="text-[10px] font-medium text-muted-foreground/60 italic">
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
