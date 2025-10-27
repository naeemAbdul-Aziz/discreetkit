/**
 * @file page.tsx
 * @description The main dashboard page for the admin section, displaying key analytics
 *              and performance metrics in a grid of cards.
 */
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CreditCard, BarChart3, Users, ShoppingCart, Hourglass, Truck, PackageCheck } from "lucide-react"

const analyticsData = [
    { title: "Total Revenue", value: "GHS 1,234.56", icon: CreditCard, description: "All-time revenue" },
    { title: "Sales", value: "+58", icon: BarChart3, description: "Sales this month" },
    { title: "Unique Customers", value: "+45", icon: Users, description: "New customers this month" },
    { title: "All Orders", value: "+70", icon: ShoppingCart, description: "All-time orders" },
    { title: "Pending Fulfillment", value: "12", icon: Hourglass, description: "Orders to be processed" },
    { title: "In Transit", value: "5", icon: Truck, description: "Orders on their way" },
    { title: "Delivered", value: "31", icon: PackageCheck, description: "Completed orders this month" },
]

export default function Dashboard() {
  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
      {analyticsData.map((item, index) => (
         <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {item.title}
              </CardTitle>
              <item.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
              <p className="text-xs text-muted-foreground">
                {item.description}
              </p>
            </CardContent>
          </Card>
      ))}
    </div>
  )
}
