/**
 * @file page.tsx
 * @description The main dashboard page for the admin section, providing a comprehensive
 *              overview of store analytics and operations. It now fetches data dynamically
 *              on the client-side to ensure it is always up-to-date.
 */
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, ShoppingCart, Users, Truck, PackageCheck, Hourglass, BarChart3, CreditCard } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase";
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardAnalytics {
    totalRevenue: number;
    totalSales: number;
    newCustomers: number;
    allOrders: number;
    pendingPaymentOrders: number;
    pendingOrders: number;
    inTransitOrders: number;
    deliveredOrders: number;
}

// Fetches orders and calculates key performance indicators.
async function getDashboardAnalytics(): Promise<DashboardAnalytics> {
    const supabase = getSupabaseClient(); // Use client-side client
    const { data: orders, error } = await supabase.from('orders').select('*');

    if (error) {
        console.error("Error fetching dashboard data:", error);
        return {
            totalRevenue: 0,
            totalSales: 0,
            newCustomers: 0,
            allOrders: 0,
            pendingPaymentOrders: 0,
            pendingOrders: 0,
            inTransitOrders: 0,
            deliveredOrders: 0,
        };
    }

    const successfulOrders = orders.filter(o => o.status !== 'pending_payment');
    const totalRevenue = successfulOrders.reduce((sum, order) => sum + (order.total_price || 0), 0);
    const totalSales = orders.filter(o => o.status !== 'pending_payment').length;
    const uniqueCustomers = new Set(successfulOrders.map(o => o.email).filter(Boolean)).size;
    
    const allOrders = orders.length;
    const pendingPaymentOrders = orders.filter(o => o.status === 'pending_payment').length;
    const pendingOrders = orders.filter(o => o.status === 'received').length;
    const inTransitOrders = orders.filter(o => o.status === 'out_for_delivery').length;
    const deliveredOrders = orders.filter(o => o.status === 'completed').length;

    return {
        totalRevenue,
        totalSales,
        newCustomers: uniqueCustomers,
        allOrders,
        pendingPaymentOrders,
        pendingOrders,
        inTransitOrders,
        deliveredOrders,
    };
}

const AnalyticsCard = ({ title, value, description, icon: Icon }: { title: string, value: string | number, description: string, icon: React.ElementType }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
    </Card>
);

const AnalyticsCardSkeleton = () => (
     <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
            <Skeleton className="h-7 w-1/3 mb-1" />
            <Skeleton className="h-3 w-full" />
        </CardContent>
    </Card>
)

export default function AdminDashboardPage() {
    const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const data = await getDashboardAnalytics();
            setAnalytics(data);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    const renderContent = () => {
        if (isLoading || !analytics) {
            return (
                <>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <AnalyticsCardSkeleton key={i} />
                    ))}
                </>
            );
        }

        return (
            <>
                <AnalyticsCard
                    title="Total Revenue"
                    value={`GHS ${analytics.totalRevenue.toFixed(2)}`}
                    description="From all successful sales"
                    icon={CreditCard}
                />
                <AnalyticsCard
                    title="Sales"
                    value={`+${analytics.totalSales}`}
                    description="Total paid transactions"
                    icon={BarChart3}
                />
                <AnalyticsCard
                    title="Unique Customers"
                    value={`+${analytics.newCustomers}`}
                    description="Based on unique email addresses"
                    icon={Users}
                />
                <AnalyticsCard
                    title="All Orders"
                    value={`+${analytics.allOrders}`}
                    description="Incl. pending payment"
                    icon={ShoppingCart}
                />
                <AnalyticsCard
                    title="Awaiting Payment"
                    value={analytics.pendingPaymentOrders}
                    description="Orders not yet paid"
                    icon={CreditCard}
                />
                <AnalyticsCard
                    title="Pending Fulfillment"
                    value={analytics.pendingOrders}
                    description="Paid and awaiting processing"
                    icon={Hourglass}
                />
                <AnalyticsCard
                    title="In Transit"
                    value={analytics.inTransitOrders}
                    description="Out for delivery"
                    icon={Truck}
                />
                <AnalyticsCard
                    title="Delivered"
                    value={analytics.deliveredOrders}
                    description="Total completed orders"
                    icon={PackageCheck}
                />
            </>
        )
    }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
                Welcome back! Here's a dynamic overview of your store's operations.
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
        {renderContent()}
      </div>

      <Card className="text-center p-8">
        <CardTitle>Manage Your Operations</CardTitle>
        <CardDescription className="mt-2 max-w-md mx-auto">
            View real-time order updates and manage your customers and products.
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
