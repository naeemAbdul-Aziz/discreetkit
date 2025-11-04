"use client";

import { useEffect, useRef } from 'react';

type Options = {
  onMessage?: (ev: MessageEvent<any>) => void;
  onError?: (ev: Event) => void;
  /** milliseconds */
  heartbeatFallbackMs?: number;
};

/**
 * Minimal SSE hook with cleanup and optional error handling.
 * It will open a single EventSource and close it on unmount.
 */
export function useSSE(url: string, opts: Options = {}) {
  const { onMessage, onError, heartbeatFallbackMs } = opts;
  const esRef = useRef<EventSource | null>(null);
  const hbRef = useRef<any>(null);

  useEffect(() => {
    const es = new EventSource(url);
    esRef.current = es;

    if (onMessage) es.onmessage = onMessage;
    if (onError) es.onerror = onError;

    if (heartbeatFallbackMs && heartbeatFallbackMs > 0) {
      hbRef.current = setInterval(() => {
        // No-op timer to keep component alive if needed
      }, heartbeatFallbackMs);
    }

    return () => {
      if (hbRef.current) clearInterval(hbRef.current);
      try {
        es.close();
      } catch {}
      esRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);
}
