/**
 * @file src/app/(admin)/dashboard/page.tsx
 * @description This is the main dashboard page for the admin portal.
 *              It will serve as the landing page after a successful login,
 *              displaying key metrics and summaries.
 */
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
      <p className="text-muted-foreground">
        Welcome to the DiscreetKit Admin Portal.
      </p>
      
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
            <CardDescription>Awaiting real data</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
            <CardDescription>Awaiting real data</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">GHS 0.00</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
