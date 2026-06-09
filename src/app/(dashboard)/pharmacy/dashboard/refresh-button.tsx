"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function RefreshButton() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={handleRefresh} 
      className="h-10 w-10 rounded-xl text-slate-400 hover:text-slate-900 transition-all"
    >
      <Icon name="refresh" opticalSize={16} className={isRefreshing ? "animate-spin" : ""} />
    </Button>
  );
}
