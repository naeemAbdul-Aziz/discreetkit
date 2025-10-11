/**
 * @file page.tsx
 * @description The main page for managing orders in the admin dashboard.
 *              It fetches and displays all orders in a sortable, filterable table.
 */
import { getAdminOrders, getAdminPharmacies } from '@/lib/actions';
import { OrdersDataTable } from './(components)/orders-data-table';

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
    const orders = await getAdminOrders();
    const pharmacies = await getAdminPharmacies();

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
                    <p className="text-muted-foreground">
                        View and manage all customer orders.
                    </p>
                </div>
            </div>
            <OrdersDataTable initialOrders={orders} pharmacies={pharmacies} />
        </div>
    );
}
