"use client";

import dynamic from 'next/dynamic';
import type { DashboardChartsClientProps } from "./dashboard-charts-client";

/**
 * Client-side only wrapper for Recharts components
 * to prevent SSR issues in Next.js Server Components.
 */
export const DynamicCharts = dynamic<DashboardChartsClientProps>(
    () => import("./dashboard-charts-client").then(mod => mod.default), 
    { 
        ssr: false,
        loading: () => <div className="h-[400px] w-full bg-slate-50/50 animate-pulse rounded-[2rem]" />
    }
);
