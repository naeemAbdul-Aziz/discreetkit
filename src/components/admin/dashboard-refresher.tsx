'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DashboardRefresher() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => {
      setIsRefreshing(false);
      setLastRefreshed(new Date());
    }, 1000); // Visual feedback delay
  };

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
      setLastRefreshed(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span>Updated {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={handleRefresh}
        disabled={isRefreshing}
        title="Refresh Data"
      >
        <RefreshCw className={cn("h-3 w-3", isRefreshing && "animate-spin")} />
        <span className="sr-only">Refresh</span>
      </Button>
    </div>
  );
}
