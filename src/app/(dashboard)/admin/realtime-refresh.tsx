"use client";

import { useSSE } from "@/hooks/use-sse";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * A lightweight client component that enables real-time 
 * refresh for a server-side dashboard.
 */
export function AdminRealtimeRefresh() {
  const router = useRouter();

  useSSE("/api/admin/realtime/orders", {
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
