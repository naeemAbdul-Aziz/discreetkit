"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Info,
  Activity,
  Zap
} from "lucide-react";
import { OrdersList } from "./orders-list";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PharmacyData = {
  pharmacy: { id: number; name: string; location: string };
  stats: {
    pending: number;
    processing: number;
    outForDelivery: number;
    completed: number;
  };
  recentOrders: any[];
  statusBreakdown: { status: string; count: number }[];
  _timestamp?: number;
};

import { useSSE } from "@/hooks/use-sse";

export default function PharmacyDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<PharmacyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  const loadData = useCallback(
    async (silent = false) => {
      try {
        if (!silent) {
          setLoading(true);
        }
        setError(null);

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("timeout")), 30000),
        );

        const fetchPromise = fetch("/api/pharmacy/dashboard", {
          cache: "no-store",
        });
        const response = (await Promise.race([
          fetchPromise,
          timeoutPromise,
        ])) as Response;

        if (response.status === 401 || response.status === 403) {
          router.push("/login");
          return;
        }

        if (response.status === 404) {
          setError("not_linked");
          setLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const json = await response.json();
        setData({ ...json, _timestamp: Date.now() });
        setDataLoaded(true);
      } catch (err: any) {
        console.error("[PharmacyDashboard] Error:", err);
        if (err.message === "timeout") setError("timeout");
        else setError("fetch_failed");
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [router],
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  useSSE(dataLoaded ? "/api/pharmacy/realtime" : "", {
    onMessage: (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "orders") {
          loadData(true);
        }
      } catch (e) {
        console.error("SSE parse error", e);
      }
    },
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8 space-y-10">
        <div className="space-y-4">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <Skeleton className="h-4 w-40 rounded-lg" />
        </div>
        <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-[2rem]" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-[2.5rem]" />
      </div>
    );
  }

  if (error === "not_linked") {
    return (
      <div className="p-4 md:p-8 max-w-2xl mx-auto mt-20">
        <div className="text-center space-y-6 bg-blue-50/50 p-12 rounded-[3rem] border border-blue-100">
           <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl">
             <Info className="h-10 w-10" />
           </div>
           <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tight text-slate-900">Account Pending</h2>
              <p className="text-slate-500 font-bold max-w-sm mx-auto">Your account is active but hasn&apos;t been assigned to a pharmacy profile yet.</p>
           </div>
           <Button 
            onClick={() => router.push("/settings")} 
            className="h-14 px-10 rounded-2xl bg-brand-teal hover:bg-brand-teal-dark font-black transition-all active:scale-95"
           >
             Contact Support
           </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-2xl mx-auto mt-20 text-center">
        <Alert variant="destructive" className="rounded-3xl p-8 border-none bg-rose-50 text-rose-900 shadow-xl">
          <AlertCircle className="h-8 w-8 mb-4 mx-auto" />
          <AlertTitle className="text-2xl font-black">Sync Error</AlertTitle>
          <AlertDescription className="font-bold text-rose-700/70 mt-2 mb-6">
            We encountered a problem while syncing your data with the central system.
          </AlertDescription>
          <Button onClick={() => loadData()} variant="outline" className="border-rose-200 text-rose-900 hover:bg-rose-100 h-12 px-8 rounded-xl font-black">
            Refresh Dashboard
          </Button>
        </Alert>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <h2 className="text-4xl font-black tracking-tighter text-slate-900 font-mono uppercase">
                {data.pharmacy.name}
              </h2>
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100 shadow-sm">
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Active</span>
              </div>
           </div>
           <p className="text-slate-400 font-black flex items-center gap-2 uppercase text-xs tracking-widest">
             <Activity className="h-4 w-4" /> Operations Dashboard • {data.pharmacy.location}
           </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-100/50 p-2 rounded-2xl border border-slate-100">
           <div className="px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-200/50">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Updated</p>
              <p className="text-sm font-black text-slate-900">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
           </div>
           <Button variant="ghost" size="icon" onClick={() => loadData(true)} className="h-12 w-12 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-white transition-all shadow-sm">
              <Zap className="h-5 w-5 fill-amber-400 text-amber-400" />
           </Button>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
        {[
          { label: "New Inbound", value: data.stats.pending, icon: Package, color: "text-brand-teal", bg: "bg-brand-teal/5", border: "border-brand-teal/10", note: "Awaiting Ack" },
          { label: "Internal Prep", value: data.stats.processing, icon: Clock, color: "text-brand-indigo", bg: "bg-brand-indigo/5", border: "border-brand-indigo/10", note: "Active Lab" },
          { label: "Outbound Ops", value: data.stats.outForDelivery, icon: Truck, color: "text-amber-600", bg: "bg-amber-50/50", border: "border-amber-100", note: "Last Mile" },
          { label: "Completed Hub", value: data.stats.completed, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50/50", border: "border-emerald-100", note: "Delivered" },
        ].map((stat, i) => (
          <Card key={i} className={cn(
            "relative overflow-hidden border-none shadow-sm transition-all duration-300 hover:shadow-lg rounded-[2rem]",
            stat.bg
          )}>
            <div className={cn("absolute top-0 left-0 w-full h-1", stat.color.replace('text-', 'bg-'))} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                {stat.label}
              </CardTitle>
              <stat.icon className={cn("h-5 w-5", stat.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-slate-900 tracking-tighter mb-1">
                {stat.value}
              </div>
              <p className="text-[10px] font-black text-slate-400/80 uppercase tracking-widest flex items-center gap-2">
                 <span className={cn("w-1.5 h-1.5 rounded-full", stat.color.replace('text-', 'bg-'))} />
                 {stat.note}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="relative mt-8">
        <div className="absolute -top-12 right-0 flex items-center gap-3">
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Update Frequency</span>
           <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={cn("w-1 h-3 rounded-full", i < 3 ? "bg-brand-teal" : "bg-slate-200")} />
              ))}
           </div>
        </div>
        <OrdersList
          key={data._timestamp || 0}
          orders={data.recentOrders}
          onOrderUpdate={() => loadData(true)}
        />
      </div>
    </div>
  );
}
