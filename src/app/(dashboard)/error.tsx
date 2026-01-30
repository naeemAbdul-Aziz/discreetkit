"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RefreshCcw, Home } from "lucide-react";

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
            <RefreshCcw className="h-4 w-4" /> Try again
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/admin">
              <Home className="h-4 w-4" /> Go to Admin Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
