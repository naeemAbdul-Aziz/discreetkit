/**
 * @file page.tsx
 * @description The main page for viewing customers in the admin dashboard.
 */
import { getAdminCustomers } from '@/lib/actions';
import { CustomersDataTable } from './(components)/customers-data-table';

export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
    const customers = await getAdminCustomers();

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
                <p className="text-muted-foreground">
                    View and manage your customer data.
                </p>
            </div>
            <CustomersDataTable customers={customers} />
        </div>
    );
}
