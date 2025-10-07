/**
 * @file page.tsx
 * @description The main dashboard page for the admin section, providing a comprehensive
 *              overview of store analytics and operations.
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, ShoppingCart, Users, Truck, PackageCheck, Hourglass, BarChart3 } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
                Welcome back! Here's a quick overview of your store's operations.
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
                <div className="text-2xl font-bold">45,231.89</div>
                <p className="text-xs text-muted-foreground">
                +20.1% from last month
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
                <div className="text-2xl font-bold">+1,234</div>
                <p className="text-xs text-muted-foreground">
                +19% from last month
                </p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                New Customers
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">+892</div>
                <p className="text-xs text-muted-foreground">
                +35 since last week
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
                <div className="text-2xl font-bold">+2350</div>
                <p className="text-xs text-muted-foreground">
                +180.1% from last month
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
                <div className="text-2xl font-bold">32</div>
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
                <div className="text-2xl font-bold">18</div>
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
                <div className="text-2xl font-bold">2,150</div>
                <p className="text-xs text-muted-foreground">
                Completed this month
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
