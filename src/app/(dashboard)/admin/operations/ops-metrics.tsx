"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";

export default function OpsMetrics({ stats }: { stats: any }) {
  if (!stats) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Riders</CardTitle>
          <Icon name="directions_bike" className="text-muted-foreground" opticalSize={20} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeRiders}</div>
          <p className="text-xs text-muted-foreground">Currently online</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Out for Delivery
          </CardTitle>
          <Icon name="inventory_2" className="text-muted-foreground" opticalSize={20} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.outForDeliveryCount}</div>
          <p className="text-xs text-muted-foreground">In transit now</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Processing</CardTitle>
          <Icon name="schedule" className="text-muted-foreground" opticalSize={20} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.processingCount}</div>
          <p className="text-xs text-muted-foreground">Being packed</p>
        </CardContent>
      </Card>

      <Card
        className={
          stats.stuckCount > 0 || stats.unassignedCount > 0
            ? "border-red-500 bg-red-50"
            : ""
        }
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-red-600">
            Attention Needed
          </CardTitle>
          <Icon name="warning" className="text-red-600" fill={true} opticalSize={20} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-700">
            {stats.stuckCount + stats.unassignedCount}
          </div>
          <p className="text-xs text-red-600 font-medium">
            Delayed or Unassigned
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
