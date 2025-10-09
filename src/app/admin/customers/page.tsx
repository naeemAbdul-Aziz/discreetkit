/**
 * @file page.tsx
 * @description The main page for viewing customers in the admin dashboard.
 */
'use client';

import { useState, useEffect } from 'react';
import { getAdminCustomers, type Customer } from '@/lib/actions';
import { CustomersDataTable } from './(components)/customers-data-table';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCustomers = async () => {
            setIsLoading(true);
            const data = await getAdminCustomers();
            setCustomers(data);
            setIsLoading(false);
        };
        fetchCustomers();
    }, []);

    const exportToCsv = () => {
        if (customers.length === 0) return;

        const headers = ['Email', 'Total Orders', 'Total Spent (GHS)', 'First Order Date', 'Last Order Date'];
        const rows = customers.map(c => [
            c.email,
            c.total_orders,
            c.total_spent.toFixed(2),
            new Date(c.first_order_date).toISOString().split('T')[0],
            new Date(c.last_order_date).toISOString().split('T')[0],
        ]);

        let csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + rows.map(e => e.join(",")).join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `discreetkit-customers-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
                    <p className="text-muted-foreground">
                        View and manage your customer data.
                    </p>
                </div>
                 <Button onClick={exportToCsv} disabled={customers.length === 0}>
                    <Download className="mr-2 h-4 w-4" />
                    Export to CSV
                </Button>
            </div>
            {isLoading ? (
                <Card className="rounded-lg">
                    <CardContent className="p-6">
                        {Array.from({ length: 5 }).map((_, i) => (
                             <div key={i} className="flex justify-between items-center p-2">
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-4 w-1/6" />
                             </div>
                        ))}
                    </CardContent>
                </Card>
            ) : (
                <CustomersDataTable customers={customers} />
            )}
        </div>
    );
}
