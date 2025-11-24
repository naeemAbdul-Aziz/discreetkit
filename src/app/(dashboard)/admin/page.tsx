import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DollarSign, ShoppingBag, Users, Activity, AlertTriangle, ArrowUpRight, Package, Truck } from "lucide-react"
import { getDashboardStats } from "@/lib/admin-data"
import { OverviewChart, StatusChart } from "@/components/admin/charts"
import { Button } from "@/components/ui/button"
import Link from "next/link"

import { DashboardRefresher } from "@/components/admin/dashboard-refresher"

export default async function AdminOverviewPage() {
  const stats = await getDashboardStats()

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 space-y-0">
        <div>
          <h2 className="font-headline text-4xl font-black tracking-tighter uppercase">Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here&apos;s what&apos;s happening with your store today.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <DashboardRefresher />
          <Button asChild>
            <Link href="/admin/products">
                <Package className="mr-2 h-4 w-4" /> Add Product
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-100 dark:border-green-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">GHS {stats.totalRevenue.toLocaleString('en-GH', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <ArrowUpRight className={`h-3 w-3 mr-1 ${stats.insights.revenueChange >= 0 ? 'text-green-600' : 'text-red-600 rotate-180'}`} /> 
              {stats.insights.revenueChange > 0 ? '+' : ''}{stats.insights.revenueChange}% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
                {stats.insights.ordersChange > 0 ? '+' : ''}{stats.insights.ordersChange}% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Partners</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.activePartners}</div>
            <p className="text-xs text-muted-foreground">+{stats.insights.newPartners} new this week</p>
          </CardContent>
        </Card>
        <Card className={stats.lowStockCount > 0 ? "border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-900" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${stats.lowStockCount > 0 ? "text-orange-500" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.lowStockCount > 0 ? "text-orange-700 dark:text-orange-300" : ""}`}>{stats.lowStockCount}</div>
            <p className="text-xs text-muted-foreground">Products below threshold</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Daily revenue for the past 7 days.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart data={stats.revenueTrend} />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
            <CardDescription>Distribution of current order statuses.</CardDescription>
          </CardHeader>
          <CardContent>
            <StatusChart data={stats.orderStatusDistribution} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>
              You made {stats.recentSales.length} sales recently.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {stats.recentSales.map((order) => (
                <div key={order.id} className="flex items-center">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                  </div>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{order.code}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.email || 'Anonymous Customer'}
                    </p>
                  </div>
                  <div className="ml-auto font-medium">
                    +GHS {Number(order.total_price).toFixed(2)}
                  </div>
                </div>
              ))}
              {stats.recentSales.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No recent sales found.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks to manage your store.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <Button variant="outline" className="h-auto py-4 justify-start" asChild>
                    <Link href="/admin/orders">
                        <Truck className="mr-4 h-5 w-5 text-blue-500" />
                        <div className="text-left">
                            <div className="font-semibold">Manage Orders</div>
                            <div className="text-xs text-muted-foreground">Assign pharmacies & update status</div>
                        </div>
                    </Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 justify-start" asChild>
                    <Link href="/admin/partners">
                        <Users className="mr-4 h-5 w-5 text-purple-500" />
                        <div className="text-left">
                            <div className="font-semibold">Manage Partners</div>
                            <div className="text-xs text-muted-foreground">Add or edit pharmacy details</div>
                        </div>
                    </Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 justify-start" asChild>
                    <Link href="/admin/products">
                        <Package className="mr-4 h-5 w-5 text-green-500" />
                        <div className="text-left">
                            <div className="font-semibold">Inventory</div>
                            <div className="text-xs text-muted-foreground">Update stock & prices</div>
                        </div>
                    </Link>
                </Button>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
