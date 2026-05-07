"use client";

import { useSSE } from "@/hooks/use-sse";
import { useRouter } from "next/navigation";

/**
 * A lightweight client component that enables real-time 
 * refresh for the server-side pharmacy dashboard.
 */
export function PharmacyRealtimeRefresh() {
  const router = useRouter();

  useSSE("/api/pharmacy/realtime", {
    onMessage: (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "orders") {
          // Trigger a server-side refresh of the current page data
          router.refresh();
        }
      } catch (e) {
        console.error("SSE parse error", e);
      }
    },
  });

  return null; // This component has no UI
}
