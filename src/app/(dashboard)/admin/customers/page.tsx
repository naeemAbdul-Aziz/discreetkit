import { Suspense } from "react";
import { getCustomers } from "@/lib/admin-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { CustomerTableClient } from "./customer-table-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * High-Velocity Customer Intelligence (Server-Side Streaming)
 */
export default async function AdminCustomersPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
            Customers
        </h2>
        <p className="text-sm font-medium text-slate-500">
            View customer details and order history.
        </p>
      </div>

      <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white/50 backdrop-blur-md">
        <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold">Aggregate Analysis</CardTitle>
            <CardDescription className="text-[10px] uppercase tracking-tighter">Derived from real-time order volume</CardDescription>
        </CardHeader>
        <CardContent>
            <Suspense fallback={<CustomerSkeleton />}>
                <CustomerLoader />
            </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

async function CustomerLoader() {
  const customers = await getCustomers();
  return <CustomerTableClient initialCustomers={customers} />;
}

function CustomerSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full rounded-xl bg-slate-50" />
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-2xl bg-slate-50/50" />
      ))}
    </div>
  );
}