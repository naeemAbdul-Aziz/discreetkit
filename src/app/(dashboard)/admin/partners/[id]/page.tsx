import { getPharmacies, getPharmacyProducts, getPharmacyAnalytics, getServiceAreas } from "@/lib/admin-actions"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { StatCard } from "@/components/dashboard/stat-card"
import { ServiceAreaManager } from "./service-area-manager"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { 
    Package, 
    CreditCard, 
    ShoppingCart, 
    CheckCircle,
    ArrowRight,
    MapPin,
    Network,
    Zap,
    Activity,
    ShieldCheck,
    Terminal,
    Map
} from "lucide-react"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic";

export default async function PharmacyDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const pharmacyId = parseInt(params.id)

  const pharmacies = await getPharmacies()
  const pharmacy = pharmacies.find(p => p.id === pharmacyId)

  if (!pharmacy) {
    return (
        <DashboardShell title="Identity Missing" breadcrumbs={[{ label: 'Node Network', href: '/admin/partners' }]}>
            <div className="flex flex-col items-center justify-center py-48 gap-8 bg-slate-50/20 rounded-2xl border border-dashed border-slate-100">
                <div className="h-20 w-20 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-xl shadow-slate-900/5">
                    <ShieldCheck className="h-10 w-10 text-slate-100" />
                </div>
                <div className="text-center space-y-2">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Protocol Failure: Identity Missing</p>
                    <p className="text-[9px] font-black text-slate-200 uppercase tracking-[0.2em]">Operational record missing from network directory.</p>
                </div>
                <Button asChild variant="outline" className="rounded-full h-12 px-10 font-black text-[10px] uppercase tracking-widest border-slate-100 text-slate-400 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-none">
                    <Link href="/admin/partners">Return to Node Registry</Link>
                </Button>
            </div>
        </DashboardShell>
    )
  }

  const [analytics, products, serviceAreas] = await Promise.all([
    getPharmacyAnalytics(pharmacyId),
    getPharmacyProducts(pharmacyId),
    getServiceAreas(pharmacyId)
  ])

  const activeCount = products.filter(p => p.is_available).length;

  return (
    <DashboardShell
        title={pharmacy.name}
        subtitle={`Operational Node Terminal ID: ${pharmacyId} • Synchronized Location: ${pharmacy.location}`}
        breadcrumbs={[
            { label: 'Master Control', href: '/admin' },
            { label: 'Node Network', href: '/admin/partners' },
            { label: 'Telemetry Details' }
        ]}
    >
      {/* QUICK STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Volume" value={analytics.totalOrders} icon={ShoppingCart} description="Lifetime cycles" />
        <StatCard title="Total Revenue" value={`₵${analytics.totalRevenue.toLocaleString()}`} icon={CreditCard} description="Gross yield" />
        <StatCard title="Inventory SKUs" value={analytics.productCount} icon={Package} description="Stock variety" />
        <StatCard title="Availability" value={activeCount} icon={ShieldCheck} description="Live protocols" />
      </div>

      {/* OPERATIONAL HUB */}
      <div className="grid gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-12">
            <div className="p-12 border border-slate-100 rounded-2xl bg-white shadow-sm transition-none">
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-6">
                        <div className="h-14 w-14 rounded-2xl bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-900/10">
                            <Map className="h-6 w-6 text-brand-teal" />
                        </div>
                        <div>
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 leading-none">
                                Operational Logistics Grid
                            </h3>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">Configure localized fulfillment areas for this terminal</p>
                        </div>
                    </div>
                </div>
                <ServiceAreaManager pharmacyId={pharmacyId} initialAreas={serviceAreas} />
            </div>
        </div>

        <div className="lg:col-span-1 space-y-12">
            <div className="p-12 border border-slate-100 rounded-2xl bg-slate-900 text-white shadow-2xl relative overflow-hidden transition-none">
                <div className="absolute -top-12 -right-12 p-8 opacity-5">
                    <Terminal className="h-64 w-64 text-white" />
                </div>
                <div className="relative space-y-12">
                    <div className="space-y-6">
                        <div className="h-12 w-12 rounded-full bg-brand-teal/10 flex items-center justify-center border border-brand-teal/20">
                            <Zap className="h-6 w-6 text-brand-teal" />
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-2xl font-black uppercase tracking-tight leading-none">Inventory Terminal</h3>
                            <p className="text-[10px] font-black text-slate-400 leading-relaxed uppercase tracking-[0.15em]">
                                Synchronize real-time stock levels, SKU availability, and custom node pricing protocols.
                            </p>
                        </div>
                    </div>
                    <Button asChild className="w-full h-16 bg-brand-teal hover:bg-brand-teal/90 text-white font-black text-[11px] uppercase tracking-widest gap-4 rounded-full shadow-2xl shadow-brand-teal/20 transition-none border-none">
                        <Link href={`/admin/partners/${pharmacyId}/inventory`}>
                            Access Operational Node
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="p-12 border border-slate-100 rounded-2xl bg-white shadow-sm transition-none">
                <div className="space-y-8">
                    <div className="flex items-center gap-4">
                        <Activity className="h-5 w-5 text-slate-300" />
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">Node Status</h4>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-50/50 border border-slate-50 transition-none">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Auth</span>
                            <div className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Active</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-50/50 border border-slate-50 transition-none">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sync Priority</span>
                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Alpha_01</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </DashboardShell>
  )
}