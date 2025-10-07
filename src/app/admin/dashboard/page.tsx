/**
 * @file page.tsx
 * @description The main dashboard page for the admin section.
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
                Welcome back! Here's a quick overview of your store.
            </p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                Total Revenue
                </CardTitle>
                <span className="text-muted-foreground">$</span>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">GHS 45,231.89</div>
                <p className="text-xs text-muted-foreground">
                +20.1% from last month
                </p>
            </CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                Orders
                </CardTitle>
                <span className="text-muted-foreground">📦</span>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">+2350</div>
                <p className="text-xs text-muted-foreground">
                +180.1% from last month
                </p>
            </CardContent>
        </Card>
      </div>
      <Card className="text-center p-8">
        <CardTitle>More Features Coming Soon</CardTitle>
        <CardDescription className="mt-2">
            Order management, customer details, and more analytics are on the way.
        </CardDescription>
        <div className="mt-6">
            <Button asChild>
                <Link href="/admin/products">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Manage Products
                </Link>
            </Button>
        </div>
      </Card>
    </div>
  );
}
