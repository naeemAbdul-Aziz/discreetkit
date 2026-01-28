import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Breadcrumb / Header area */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Stats Cards Row (Common pattern) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>

      {/* Main Content / Table Area */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" /> {/* Filter/Search */}
          <Skeleton className="h-10 w-32" /> {/* Action Button */}
        </div>
        <div className="border rounded-md p-4 space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" /> {/* Table Header */}
            <Skeleton className="h-16 w-full" /> {/* Row 1 */}
            <Skeleton className="h-16 w-full" /> {/* Row 2 */}
            <Skeleton className="h-16 w-full" /> {/* Row 3 */}
            <Skeleton className="h-16 w-full" /> {/* Row 4 */}
            <Skeleton className="h-16 w-full" /> {/* Row 5 */}
          </div>
        </div>
      </div>
    </div>
  );
}
