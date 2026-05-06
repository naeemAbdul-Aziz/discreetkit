"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export function RefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRefresh}
      disabled={isPending}
      className="min-w-[100px]"
    >
      {isPending ? (
        <Icon name="progress_activity" className="mr-2 animate-spin" opticalSize={18} />
      ) : (
        <Icon name="refresh" className="mr-2" opticalSize={18} />
      )}
      {isPending ? "Refreshing..." : "Refresh"}
    </Button>
  );
}
