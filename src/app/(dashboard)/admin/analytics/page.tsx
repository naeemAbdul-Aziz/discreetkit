import { getDashboardStats } from "@/lib/admin-actions";
import AnalyticsDashboard from "./analytics-dashboard";

export default async function AdminAnalyticsPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
        <p className="text-muted-foreground">
          Detailed reporting and data hub for stakeholders.
        </p>
      </div>

      <AnalyticsDashboard data={stats} />
    </div>
  );
}