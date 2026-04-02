import { getDashboardStats } from "@/lib/admin-actions";
import AnalyticsDashboard from "./analytics-dashboard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminAnalyticsPage() {
  const stats = await getDashboardStats();

  // Flatten stats to match AnalyticsDashboard's expected flat shape
  const flatStats = {
    totalRevenue: stats.metrics.totalRevenue,
    totalOrders: stats.metrics.totalOrders,
    activePatients: stats.metrics.activePatients,
    revenueChart: stats.revenueChart,
    categoryChart: stats.categoryChart,
    regionChart: stats.regionChart,
    topProducts: stats.topProducts,
    topPharmacies: stats.topPharmacies,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
        <p className="text-muted-foreground">
          Detailed reporting and data hub for stakeholders.
        </p>
      </div>

      <AnalyticsDashboard data={flatStats} />
    </div>
  );
}