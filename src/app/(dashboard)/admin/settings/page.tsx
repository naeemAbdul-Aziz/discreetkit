import { SettingsForm } from "./settings-form"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-headline text-3xl font-bold tracking-tight uppercase">Settings</h2>
        <p className="text-muted-foreground">
          Manage your store preferences and account security.
        </p>
      </div>
      <SettingsForm />
    </div>
  )
}
