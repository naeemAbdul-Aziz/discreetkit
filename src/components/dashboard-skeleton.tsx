import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Stats Cards Row */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-28 rounded-xl bg-slate-100" />
        <Skeleton className="h-28 rounded-xl bg-slate-100" />
        <Skeleton className="h-28 rounded-xl bg-slate-100" />
        <Skeleton className="h-28 rounded-xl bg-slate-100" />
      </div>

      {/* Main Content Area */}
      <div className="space-y-4">
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b bg-slate-50/50">
             <Skeleton className="h-5 w-48 bg-slate-200" />
          </div>
          <div className="p-0">
            <div className="divide-y divide-slate-100">
              <Skeleton className="h-14 w-full bg-white rounded-none border-t-0" /> {/* Row 1 */}
              <Skeleton className="h-14 w-full bg-slate-50/30 rounded-none border-t-0" /> {/* Row 2 */}
              <Skeleton className="h-14 w-full bg-white rounded-none border-t-0" /> {/* Row 3 */}
              <Skeleton className="h-14 w-full bg-slate-50/30 rounded-none border-t-0" /> {/* Row 4 */}
              <Skeleton className="h-14 w-full bg-white rounded-none border-t-0" /> {/* Row 5 */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
