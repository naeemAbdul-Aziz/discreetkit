
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
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
            {type === 'pharmacy' ? <Trophy className="h-4 w-4 text-amber-500" /> : <TrendingUp className="h-4 w-4 text-blue-500" />}
            {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No data available.</p>
          ) : (
            items.slice(0, 5).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between group">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`
                    flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold
                    ${idx === 0 ? 'bg-amber-100 text-amber-700' : 
                      idx === 1 ? 'bg-slate-100 text-slate-700' :
                      idx === 2 ? 'bg-orange-50 text-orange-700' : 'bg-gray-50 text-gray-500'}
                  `}>
                    #{idx + 1}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium truncate" title={item.name}>{item.name}</span>
                    {item.subtext && <span className="text-xs text-muted-foreground truncate">{item.subtext}</span>}
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0 ml-2">
                    <span className="text-sm font-bold">{item.value}</span>
                    {item.meta && <span className="text-xs text-muted-foreground">{item.meta}</span>}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
