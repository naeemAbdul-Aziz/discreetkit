/**
 * @file page.tsx
 * @description The main dashboard page for the admin section, providing a comprehensive
 *              overview of store analytics and operations.
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, ShoppingCart, Users, Truck, PackageCheck, Hourglass, BarChart3 } from "lucide-react";
import { getSupabaseAdminClient } from "@/lib/supabase";
import type { Order } from "@/lib/data";

// Fetches orders and calculates key performance indicators.
async function getDashboardAnalytics() {
    const supabase = getSupabaseAdminClient();
    const { data: orders, error } = await supabase.from('orders').select('*');

    if (error) {
        console.error("Error fetching dashboard data:", error);
        // Return zeroed-out data on error
        return {
            totalRevenue: 0,
            totalSales: 0,
            newCustomers: 0,
            allOrders: 0,
            pendingOrders: 0,
            inTransitOrders: 0,
            deliveredOrders: 0,
        };
    }

    // A successful order is any order that is NOT pending payment.
    // This includes 'received', 'processing', 'out_for_delivery', and 'completed'.
    const successfulOrders = orders.filter(o => o.status !== 'pending_payment');

    const totalRevenue = successfulOrders.reduce((sum, order) => sum + (order.total_price || 0), 0);
    const totalSales = successfulOrders.length;

    // Use email to approximate unique customers for this metric
    const uniqueCustomers = new Set(successfulOrders.map(o => o.email).filter(Boolean)).size;
    
    // All orders includes those pending payment.
    const allOrders = orders.length;

    // Breakdown by fulfillment status
    const pendingOrders = orders.filter(o => o.status === 'received').length;
    const inTransitOrders = orders.filter(o => o.status === 'out_for_delivery').length;
    const deliveredOrders = orders.filter(o => o.status === 'completed').length;

    return {
        totalRevenue,
        totalSales,
        newCustomers: uniqueCustomers,
        allOrders,
        pendingOrders,
        inTransitOrders,
        deliveredOrders,
    };
}


export default async function AdminDashboardPage() {
    const analytics = await getDashboardAnalytics();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
                Welcome back! Here's a real-time overview of your store's operations.
            </p>
        </div>
         <Button asChild>
            <Link href="/admin/products">
                <PlusCircle />
                Manage Products
            </Link>
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                Total Revenue
                </CardTitle>
                <span className="text-muted-foreground font-bold">GHS</span>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{analytics.totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                From all successful sales
                </p>
            </CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                Sales
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">+{analytics.totalSales}</div>
                <p className="text-xs text-muted-foreground">
                Total successful transactions
                </p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                Unique Customers
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">+{analytics.newCustomers}</div>
                <p className="text-xs text-muted-foreground">
                Based on unique email addresses
                </p>
            </CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                All Orders
                </CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">+{analytics.allOrders}</div>
                <p className="text-xs text-muted-foreground">
                Total orders placed
                </p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                Pending
                </CardTitle>
                <Hourglass className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{analytics.pendingOrders}</div>
                <p className="text-xs text-muted-foreground">
                Awaiting processing
                </p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                In Transit
                </CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{analytics.inTransitOrders}</div>
                <p className="text-xs text-muted-foreground">
                Out for delivery
                </p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                Delivered
                </CardTitle>
                <PackageCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{analytics.deliveredOrders}</div>
                <p className="text-xs text-muted-foreground">
                Total completed orders
                </p>
            </CardContent>
        </Card>
      </div>
      <Card className="text-center p-8">
        <CardTitle>More Management Features Coming Soon</CardTitle>
        <CardDescription className="mt-2 max-w-md mx-auto">
            A full table for managing orders and viewing customer details will be added here. For now, you can manage your products.
        </CardDescription>
        <div className="mt-6 flex justify-center gap-4">
            <Button asChild>
                <Link href="/admin/orders">
                    <ShoppingCart />
                    Go to Orders
                </Link>
            </Button>
             <Button asChild variant="outline">
                <Link href="/admin/customers">
                    <Users />
                    View Customers
                </Link>
            </Button>
        </div>
      </Card>
    </div>
  );
}
