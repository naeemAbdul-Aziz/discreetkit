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
  Zap,
  Users,
  ShieldCheck,
  Verified,
  TrendingUp,
  BarChart3
} from "lucide-react";
import { OrdersList } from "./orders-list";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePharmacy } from "@/components/dashboard/pharmacy-context";
import { getHubAnalytics } from "@/lib/hub-actions";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Cell } from 'recharts';

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
  const { isHub, pharmacy: hubInfo } = usePharmacy();
  const [data, setData] = useState<PharmacyData | null>(null);
  const [hubStats, setHubStats] = useState<{ totalEnrolled: number, adherenceRate: number } | null>(null);
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

        if (json) {
          setData({ ...json, _timestamp: Date.now() });
          
          if (isHub) {
            const hStats = await getHubAnalytics();
            setHubStats(hStats);
          }
        }
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
    [router, isHub],
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
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-10">
        <div className="space-y-4">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <Skeleton className="h-4 w-40 rounded-lg" />
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    );
  }

  if (error === "not_linked") {
    return (
      <div className="p-4 md:p-8 max-w-2xl mx-auto mt-20">
        <div className="text-center space-y-6 bg-slate-50 p-12 rounded-3xl border border-slate-100">
           <div className="w-20 h-20 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center mx-auto">
             <Info className="h-10 w-10" />
           </div>
           <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Account Pending</h2>
              <p className="text-slate-500 max-w-sm mx-auto font-medium">Your account is ready but hasn&apos;t been linked to a pharmacy yet.</p>
           </div>
           <Button 
            onClick={() => router.push("/settings")} 
            className="h-12 px-10 rounded-xl bg-brand-teal hover:bg-brand-teal/90 font-bold"
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
        <Alert variant="destructive" className="rounded-2xl p-8 border-none bg-rose-50 text-rose-900 shadow-sm">
          <AlertCircle className="h-8 w-8 mb-4 mx-auto text-rose-500" />
          <AlertTitle className="text-xl font-bold">Connection Error</AlertTitle>
          <AlertDescription className="font-medium text-rose-700/80 mt-2 mb-6">
            We had trouble reaching the server. Please try refreshing.
          </AlertDescription>
          <Button onClick={() => loadData()} variant="outline" className="border-rose-200 text-rose-900 hover:bg-rose-100 h-12 px-8 rounded-xl font-bold">
            Try Again
          </Button>
        </Alert>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <div className="flex items-center gap-3 mb-1">
               <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                {data.pharmacy.name}
              </h2>
              <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-100">
                 <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                 <span className="text-[10px] font-bold uppercase tracking-wider">Active</span>
              </div>
           </div>
           <p className="text-slate-500 font-medium text-sm">
             {data.pharmacy.location}
           </p>
        </div>
 
        <div className="flex items-center gap-3">
           <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last sync</p>
              <p className="text-sm font-bold text-slate-900">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
           </div>
           <Button variant="outline" size="icon" onClick={() => loadData(true)} className="h-10 w-10 rounded-xl text-slate-400 hover:text-slate-900 transition-all">
              <Zap className="h-4 w-4" />
           </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {isHub ? (
          <>
            {[
              { label: "Patients Enrolled", value: hubStats?.totalEnrolled || 0, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50/50", note: "Active subscriptions" },
              { label: "Adherence Rate", value: `${hubStats?.adherenceRate || 0}%`, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50/50", note: "Successful refills" },
              { label: "Identity Checks", value: data.recentOrders.filter(o => o.status === 'pending_verification').length, icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50/50", note: "Waiting for verification" },
              { label: "Total Refills", value: data.stats.completed, icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50/50", note: "Completed cycles" },
            ].map((stat, i) => (
              <Card key={i} className={cn("relative overflow-hidden border-none shadow-sm rounded-2xl p-6", stat.bg)}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                  <stat.icon className={cn("h-4 w-4", stat.color)} />
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
                <p className="text-[10px] font-medium text-slate-500">{stat.note}</p>
              </Card>
            ))}
          </>
        ) : (
          <>
            {[
              { label: "New Orders", value: data.stats.pending, icon: Package, color: "text-brand-teal", bg: "bg-slate-50", note: "Awaiting confirmation" },
              { label: "Preparing", value: data.stats.processing, icon: Clock, color: "text-brand-indigo", bg: "bg-slate-50", note: "Currently being packed" },
              { label: "Out for Delivery", value: data.stats.outForDelivery, icon: Truck, color: "text-amber-600", bg: "bg-slate-50", note: "In transit to patient" },
              { label: "Delivered", value: data.stats.completed, icon: CheckCircle, color: "text-emerald-600", bg: "bg-slate-50", note: "Orders completed" },
            ].map((stat, i) => (
              <Card key={i} className={cn("relative overflow-hidden border border-slate-100 shadow-sm rounded-2xl p-6", stat.bg)}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                  <stat.icon className={cn("h-4 w-4", stat.color)} />
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
                <p className="text-[10px] font-medium text-slate-500">{stat.note}</p>
              </Card>
            ))}
          </>
        )}
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-6 rounded-2xl border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900">Recent Orders</h3>
            <Button variant="ghost" size="sm" onClick={() => router.push('/pharmacy/orders')} className="text-xs font-bold text-brand-teal">
              View All
            </Button>
          </div>
          <OrdersList
            key={data._timestamp || 0}
            orders={data.recentOrders}
            onOrderUpdate={() => loadData(true)}
          />
        </Card>

        <Card className="p-6 rounded-2xl border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="h-4 w-4 text-brand-teal" />
            <h3 className="font-bold text-slate-900">Order Mix</h3>
          </div>
          <div className="h-[240px] w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.statusBreakdown}>
                <XAxis dataKey="status" hide />
                <YAxis hide />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Bar dataKey="count" radius={[4, 4, 4, 4]}>
                  {data.statusBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#187f76', '#1e3a5f', '#f59e0b', '#10b981'][index % 4]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-6">
            {data.statusBreakdown.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: ['#187f76', '#1e3a5f', '#f59e0b', '#10b981'][i % 4] }} />
                <span className="text-[10px] font-bold text-slate-500 uppercase truncate">{item.status.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
