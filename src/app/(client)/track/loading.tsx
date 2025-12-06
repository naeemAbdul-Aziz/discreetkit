import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function TrackLoading() {
  return (
    <div className="container max-w-5xl py-8 space-y-8 animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
      </div>

      {/* Search Bar Skeleton */}
      <Card className="rounded-3xl border-muted shadow-sm overflow-hidden">
        <div className="h-24 bg-muted/20 p-6 flex items-center">
            <Skeleton className="h-12 w-full rounded-2xl" />
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {/* LEFT COLUMN: Status & Items (Span 2) */}
        <div className="md:col-span-2 space-y-6">
          {/* Status Stepper Skeleton */}
          <Card className="rounded-3xl border-muted shadow-sm min-h-[300px]">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-8">
                <Skeleton className="h-12 w-full" />
                <div className="flex justify-between px-4">
                   <Skeleton className="h-16 w-16 rounded-full" />
                   <Skeleton className="h-16 w-16 rounded-full" />
                   <Skeleton className="h-16 w-16 rounded-full" />
                   <Skeleton className="h-16 w-16 rounded-full" />
                </div>
            </CardContent>
          </Card>

          {/* Items Skeleton */}
          <Card className="rounded-3xl border-muted shadow-sm">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
               {[1, 2].map((i) => (
                   <div key={i} className="flex gap-4">
                       <Skeleton className="h-12 w-12 rounded-lg" />
                       <div className="space-y-2 flex-1">
                           <Skeleton className="h-4 w-3/4" />
                           <Skeleton className="h-3 w-1/4" />
                       </div>
                   </div>
               ))}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Summary & History (Span 1) */}
        <div className="space-y-6">
          {/* Summary Skeleton */}
          <Card className="rounded-3xl border-muted shadow-sm bg-muted/20 h-[200px]">
             <CardContent className="p-6 space-y-4">
                 <Skeleton className="h-4 w-full" />
                 <Skeleton className="h-4 w-full" />
                 <Skeleton className="h-8 w-full mt-4" />
             </CardContent>
          </Card>

           {/* Event History Skeleton */}
           <Card className="rounded-3xl border-muted shadow-sm min-h-[400px]">
            <CardHeader>
              <Skeleton className="h-5 w-24" />
            </CardHeader>
            <CardContent className="space-y-6 ml-2">
                 {[1, 2, 3].map((i) => (
                     <div key={i} className="flex gap-4">
                         <Skeleton className="h-3 w-3 rounded-full mt-1" />
                         <div className="space-y-2 flex-1">
                             <Skeleton className="h-4 w-20 rounded-full" />
                             <Skeleton className="h-3 w-full" />
                         </div>
                     </div>
                 ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
