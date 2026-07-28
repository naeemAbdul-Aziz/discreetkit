"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Icon } from "@/components/ui/icon";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log to an error reporting service
    // console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8">
      <div className="max-w-lg w-full space-y-6">
        <Alert variant="destructive">
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>
            An error occurred in the dashboard. If the issue persists, please
            contact support. {error?.message}
          </AlertDescription>
        </Alert>

        <div className="flex flex-wrap gap-3">
          <Button onClick={() => reset()} className="gap-2">
            <Icon name="refresh" opticalSize={16} /> Try again
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/admin">
              <Icon name="home" opticalSize={16} /> Go to Admin Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
