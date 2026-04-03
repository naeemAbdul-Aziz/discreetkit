import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MetricsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="border border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-3 w-20 bg-slate-100" />
            <Skeleton className="h-4 w-4 bg-slate-100 rounded-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-7 w-24 bg-slate-200 mb-1" />
            <Skeleton className="h-3 w-32 bg-slate-100" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <Card className="border border-slate-200 shadow-sm overflow-hidden">
      <CardHeader>
        <Skeleton className="h-5 w-40 bg-slate-200 mb-2" />
        <Skeleton className="h-4 w-64 bg-slate-100" />
      </CardHeader>
      <CardContent className="h-[300px] flex items-end gap-2 px-6 pb-6">
        {[60, 80, 45, 70, 55, 90, 40, 85, 50, 75, 65, 95].map((h, i) => (
          <Skeleton 
            key={i} 
            className="flex-1 bg-slate-100 rounded-t-md" 
            style={{ height: `${h}%` }}
          />
        ))}
      </CardContent>
    </Card>
  );
}

export function RankingsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[...Array(2)].map((_, i) => (
        <Card key={i} className="border border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="pb-3 border-b bg-slate-50/30">
            <Skeleton className="h-5 w-32 bg-slate-200" />
          </CardHeader>
          <CardContent className="p-0">
            {[...Array(5)].map((_, j) => (
              <div key={j} className="flex items-center justify-between p-4 border-b border-slate-100">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-40 bg-slate-100" />
                  <Skeleton className="h-3 w-24 bg-slate-50" />
                </div>
                <Skeleton className="h-4 w-12 bg-slate-100" />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function PulseSkeleton() {
    return (
      <Card className="border border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="pb-3 border-b bg-slate-50/30">
          <Skeleton className="h-5 w-40 bg-slate-200" />
        </CardHeader>
        <CardContent className="p-0">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex gap-3 p-4 border-b border-slate-100">
              <Skeleton className="h-8 w-8 rounded-full bg-slate-100 shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="flex justify-between">
                    <Skeleton className="h-4 w-32 bg-slate-100" />
                    <Skeleton className="h-3 w-16 bg-slate-50" />
                </div>
                <Skeleton className="h-3 w-full bg-slate-50" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
}
