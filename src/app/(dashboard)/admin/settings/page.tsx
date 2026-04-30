import { SettingsForm } from "./settings-form"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Settings, ShieldCheck, Terminal, Loader2 } from "lucide-react"

/**
 * FAANG-Level System Configuration
 * High-Density Operational Parameters
 */
export default function SettingsPage() {
  return (
    <DashboardShell
        title="SYSTEM_CONFIGURATION"
        subtitle="Universal node parameters, security protocols & master terminal orchestration"
        breadcrumbs={[{ label: 'MASTER_CONTROL', href: '/admin' }, { label: 'SYSTEM_CONFIGURATION' }]}
    >
      <div className="rounded-[40px] border border-slate-100 bg-white shadow-2xl shadow-slate-900/5 p-12 overflow-hidden transition-none mx-4">
          <div className="flex items-center gap-8 mb-16 px-4">
              <div className="h-16 w-16 rounded-3xl bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-900/10">
                  <Settings className="h-8 w-8 text-brand-teal" />
              </div>
              <div className="space-y-3">
                  <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">Master Control Interface</h2>
                  <div className="flex items-center gap-4">
                      <div className="h-1 w-8 bg-brand-teal rounded-full" />
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none">Global system parameters & node security synchronization</p>
                  </div>
              </div>
          </div>
          <SettingsForm />
      </div>
    </DashboardShell>
  )
}
