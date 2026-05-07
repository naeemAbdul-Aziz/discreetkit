import { createSupabaseServerClient } from "@/lib/supabase";
import { getHubAnalytics } from "@/lib/hub-actions";
import { OrdersList } from "./orders-list";
import { PharmacyRealtimeRefresh } from "./realtime-refresh";
import { RefreshButton } from "./refresh-button";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PharmacyDashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Get pharmacy record
  const { data: pharmacy, error: pharmacyError } = await supabase
    .from('pharmacies')
    .select('id, name, location, is_partner_hub')
    .eq('user_id', user.id)
    .single();

  if (pharmacyError || !pharmacy) {
    return (
      <div className="p-4 md:p-8 max-w-2xl mx-auto mt-20">
        <div className="text-center space-y-6 bg-slate-50 p-12 rounded-3xl border border-slate-100">
           <div className="w-20 h-20 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center mx-auto">
             <Icon name="info" opticalSize={40} />
           </div>
           <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Account Pending</h2>
              <p className="text-slate-500 max-w-sm mx-auto font-medium">Your account is ready but hasn&apos;t been linked to a pharmacy yet.</p>
           </div>
           <Link href="/pharmacy/settings">
             <Button className="h-12 px-10 rounded-xl bg-brand-teal hover:bg-brand-teal/90 font-bold mt-4">
               Contact Support
             </Button>
           </Link>
        </div>
      </div>
    );
  }

  const isHub = pharmacy.is_partner_hub;

  // 2. Parallel fetch recent orders and status counts
  const [ordersResult, statsResult] = await Promise.all([
    supabase
      .from('orders')
      .select('id, code, status, pharmacy_ack_status, total_price_ghs, created_at, items, delivery_area')
      .eq('pharmacy_id', pharmacy.id)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('orders')
      .select('status, pharmacy_ack_status')
      .eq('pharmacy_id', pharmacy.id)
  ]);

  const recentOrders = ordersResult.data || [];
  const statsData = statsResult.data || [];

  const stats = {
    pending: statsData.filter(o => o.status === 'received' && o.pharmacy_ack_status === 'pending').length,
    processing: statsData.filter(o => o.status === 'processing').length,
    outForDelivery: statsData.filter(o => o.status === 'out_for_delivery').length,
    completed: statsData.filter(o => o.status === 'completed').length,
  };

  let hubStats = null;
  if (isHub) {
    hubStats = await getHubAnalytics();
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <PharmacyRealtimeRefresh />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <div className="flex items-center gap-3 mb-1">
               <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                {pharmacy.name}
              </h2>
               <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full border border-emerald-100">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-bold">Active</span>
               </div>
           </div>
           <p className="text-slate-500 font-medium text-sm">
             {pharmacy.location}
           </p>
        </div>
 
        <div className="flex items-center gap-3">
           <div className="text-right">
              <p className="text-xs font-bold text-slate-400">Last Sync</p>
              <p className="text-sm font-bold text-slate-900">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
           </div>
           <RefreshButton />
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {isHub ? (
          <>
            {[
              { label: "Patients Enrolled", value: hubStats?.totalEnrolled || 0, icon: "group", color: "text-emerald-600", bg: "bg-emerald-50/50", note: "Active subscriptions" },
              { label: "Adherence Rate", value: `${hubStats?.adherenceRate || 0}%`, icon: "trending_up", color: "text-emerald-500", bg: "bg-emerald-50/50", note: "Successful refills" },
              { label: "Identity Checks", value: recentOrders.filter(o => o.status === 'pending_verification').length, icon: "verified_user", color: "text-emerald-600", bg: "bg-emerald-50/50", note: "Waiting for verification" },
              { label: "Total Refills", value: stats.completed, icon: "check_circle", color: "text-emerald-500", bg: "bg-emerald-50/50", note: "Completed cycles" },
            ].map((stat, i) => (
              <Card key={i} className={cn("relative overflow-hidden border-none shadow-sm rounded-2xl p-6", stat.bg)}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-bold text-slate-500">{stat.label}</p>
                  <Icon name={stat.icon} className={cn("h-5 w-5", stat.color)} fill />
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
                <p className="text-[10px] font-medium text-slate-500">{stat.note}</p>
              </Card>
            ))}
          </>
        ) : (
          <>
            {[
              { label: "New Orders", value: stats.pending, icon: "package_2", color: "text-brand-teal", bg: "bg-slate-50", note: "Awaiting confirmation" },
              { label: "Preparing", value: stats.processing, icon: "schedule", color: "text-brand-indigo", bg: "bg-slate-50", note: "Currently being packed" },
              { label: "Out for Delivery", value: stats.outForDelivery, icon: "local_shipping", color: "text-amber-600", bg: "bg-slate-50", note: "In transit to patient" },
              { label: "Delivered", value: stats.completed, icon: "check_circle", color: "text-emerald-600", bg: "bg-slate-50", note: "Orders completed" },
            ].map((stat, i) => (
              <Card key={i} className={cn("relative overflow-hidden border border-slate-100 shadow-sm rounded-2xl p-6", stat.bg)}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-bold text-slate-500">{stat.label}</p>
                  <Icon name={stat.icon} className={cn("h-5 w-5", stat.color)} fill />
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
                <p className="text-[10px] font-medium text-slate-500">{stat.note}</p>
              </Card>
            ))}
          </>
        )}
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Recent Orders</h3>
              <p className="text-xs font-bold text-slate-400 mt-1">Live fulfillment queue</p>
            </div>
            <Link href="/pharmacy/ledger">
              <Button variant="ghost" size="sm" className="text-xs font-bold text-brand-teal hover:bg-brand-teal/5 rounded-lg px-4">
                View Database
              </Button>
            </Link>
          </div>
          
          <OrdersList orders={recentOrders} />
        </div>
      </div>
    </div>
  );
}
