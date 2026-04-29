"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bike, Clock, AlertTriangle, Package } from "lucide-react";
import { cn } from "@/lib/utils";

export default function OpsMetrics({ stats }: { stats: any }) {
  if (!stats) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border border-slate-200/80 shadow-sm bg-white rounded-[2rem] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Active Riders</CardTitle>
          <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center">
            <Bike className="h-4 w-4 text-slate-900" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black text-slate-900 tabular-nums">{stats.activeRiders}</div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-1">Currently online</p>
        </CardContent>
      </Card>

      <Card className="border border-slate-200/80 shadow-sm bg-white rounded-[2rem] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Out for Delivery</CardTitle>
          <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center">
            <Package className="h-4 w-4 text-slate-900" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black text-slate-900 tabular-nums">{stats.outForDeliveryCount}</div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-1">In transit now</p>
        </CardContent>
      </Card>

      <Card className="border border-slate-200/80 shadow-sm bg-white rounded-[2rem] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Processing</CardTitle>
          <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center">
            <Clock className="h-4 w-4 text-slate-900" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black text-slate-900 tabular-nums">{stats.processingCount}</div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-1">Being packed</p>
        </CardContent>
      </Card>

      <Card
        className={cn(
          "rounded-[2rem] overflow-hidden border-2 shadow-xl shadow-red-100/50",
          stats.stuckCount > 0 || stats.unassignedCount > 0
            ? "border-red-500 bg-red-50/30"
            : "border-slate-200/80 bg-white"
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className={cn(
            "text-[10px] font-black uppercase tracking-[0.15em]",
            stats.stuckCount > 0 || stats.unassignedCount > 0 ? "text-red-500" : "text-slate-400"
          )}>
            Attention Needed
          </CardTitle>
          <div className={cn(
            "h-8 w-8 rounded-xl flex items-center justify-center",
            stats.stuckCount > 0 || stats.unassignedCount > 0 ? "bg-red-500 text-white" : "bg-slate-50 text-slate-900"
          )}>
            <AlertTriangle className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className={cn(
            "text-3xl font-black tabular-nums",
            stats.stuckCount > 0 || stats.unassignedCount > 0 ? "text-red-600" : "text-slate-900"
          )}>
            {stats.stuckCount + stats.unassignedCount}
          </div>
          <p className={cn(
            "text-[10px] font-bold uppercase tracking-tight mt-1",
            stats.stuckCount > 0 || stats.unassignedCount > 0 ? "text-red-500" : "text-slate-400"
          )}>
            Delayed or Unassigned
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
