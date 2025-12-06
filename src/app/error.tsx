"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-state";
import { LoaderOne } from "@/components/ui/loader";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-4">
      <ErrorState
        title="Something went wrong!"
        description={`We encountered an unexpected error: ${error.message || "Unknown error"}`}
        retryAction={() => reset()}
        showHomeButton={true}
        className="max-w-md w-full shadow-lg bg-background border-border"
      />
    </div>
  );
}
