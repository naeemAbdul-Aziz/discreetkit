import { SettingsForm } from "./settings-form"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Settings</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">
          Manage your store preferences and account security.
        </p>
      </div>
      <SettingsForm />
    </div>
  )
}
