
import { Skeleton } from "@/components/ui/skeleton"

export default function ProductsLoading() {
  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-12 md:px-6 md:py-24">
        <div className="mx-auto max-w-7xl">
            {/* Header Skeleton */}
            <div className="text-center mb-8 space-y-4">
                <Skeleton className="h-10 w-2/3 md:w-1/3 mx-auto rounded-lg" />
                <Skeleton className="h-6 w-full md:w-1/2 mx-auto rounded-lg" />
            </div>
            
            {/* Filters Skeleton */}
             <div className="flex flex-col items-center justify-center gap-4 sm:gap-8 mb-12">
                <div className="flex gap-2 flex-wrap justify-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-24 rounded-full" />
                    ))}
                </div>
                <Skeleton className="h-10 w-[180px] rounded-md" />
            </div>

            {/* Grid Skeleton */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="space-y-4">
                         <Skeleton className="aspect-square rounded-3xl" />
                         <div className="space-y-2 px-2">
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="h-4 w-1/3" />
                         </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  )
}
