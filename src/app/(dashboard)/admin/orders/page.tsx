import { getOrders } from "@/lib/admin-actions"
import { OrdersTable } from "./orders-table"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"

export default async function OrdersPage() {
  const orders = await getOrders()

  return (
    <div className="space-y-8">
      <Breadcrumbs items={[
        { label: 'Dashboard', href: '/admin' },
        { label: 'Orders' }
      ]} />
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
        <p className="text-muted-foreground">Manage customer orders and pharmacy assignments.</p>
      </div>
      <OrdersTable initialOrders={orders} />
    </div>
  )
}