"use client";

import { useSSE } from "@/hooks/use-sse";
import { useRouter } from "next/navigation";

export function PharmacyRealtimeRefresh() {
  const router = useRouter();

  useSSE("/api/pharmacy/realtime", {
    onMessage: (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "orders") {
          router.refresh();
        }
      } catch (e) {
        console.error("SSE parse error", e);
      }
    },
  });

  return null;
}
