import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Truck, CheckCircle, Clock } from 'lucide-react'
import { getPharmacyStats, getPharmacyOrders, getCurrentPharmacy } from '@/lib/pharmacy-actions'
import { OrdersList } from './orders-list'

export default async function PharmacyDashboardPage() {
  // Get pharmacy info
  const { pharmacy, error: pharmError } = await getCurrentPharmacy()
  
  if (pharmError || !pharmacy) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              {pharmError || "No pharmacy account found for this user."}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Get stats and recent orders
  const { stats } = await getPharmacyStats()
  const { orders } = await getPharmacyOrders()

  return (
    <>
      <div className="mb-6 px-2 md:px-0">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight break-words">{pharmacy.name}</h2>
        <p className="text-muted-foreground text-sm md:text-base break-words">{pharmacy.location}</p>
      </div>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-4">
        <Card className="min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">New Assigned Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold">{stats?.pending || 0}</div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>
        <Card className="min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Processing</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold">{stats?.processing || 0}</div>
            <p className="text-xs text-muted-foreground">Currently being prepared</p>
          </CardContent>
        </Card>
        <Card className="min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Out for Delivery</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold">{stats?.outForDelivery || 0}</div>
            <p className="text-xs text-muted-foreground">On their way to customers</p>
          </CardContent>
        </Card>
        <Card className="min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Completed This Week</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold">+{stats?.completedThisWeek || 0}</div>
            <p className="text-xs text-muted-foreground">Successfully delivered</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 mt-6 px-2 md:px-0">
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Recent Orders</CardTitle>
            <CardDescription className="text-xs md:text-sm">Orders assigned to your pharmacy</CardDescription>
          </CardHeader>
          <CardContent className="p-2 md:p-6">
            <OrdersList orders={orders || []} pharmacyId={pharmacy.id} />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
