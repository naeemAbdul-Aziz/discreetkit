"use client";

import { StatCard } from "@/components/dashboard/stat-card";
import { 
    Bike, 
    Clock, 
    AlertTriangle, 
    Package, 
    Zap, 
    Activity,
    ShieldAlert,
    Timer
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OpsMetricsProps {
    stats: {
        activeRiders: number;
        processingCount: number;
        outForDeliveryCount: number;
        stuckCount: number;
        unassignedCount: number;
    };
}

export default function OpsMetrics({ stats }: OpsMetricsProps) {
    const criticalVolume = stats.stuckCount + stats.unassignedCount;

    return (
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 px-4">
            <StatCard 
                title="ACTIVE_RIDERS" 
                value={stats.activeRiders} 
                icon={Bike} 
                description="LOGISTICS_READY" 
            />
            <StatCard 
                title="PROCESSING" 
                value={stats.processingCount} 
                icon={Clock} 
                description="NODE_SYNCHRONIZATION" 
            />
            <StatCard 
                title="IN_TRANSIT" 
                value={stats.outForDeliveryCount} 
                icon={Package} 
                description="FULFILLMENT_ACTIVE" 
            />
            <StatCard 
                title="CRITICAL_ALERTS" 
                value={criticalVolume} 
                icon={AlertTriangle} 
                description="PROTOCOL_VIOLATION"
                className={cn(
                  "border-none transition-none shadow-2xl shadow-slate-900/5",
                  criticalVolume > 0 ? "bg-rose-500/5 text-rose-600 border border-rose-500/10 shadow-rose-500/10" : "bg-white"
                )}
            />
        </div>
    );
}
