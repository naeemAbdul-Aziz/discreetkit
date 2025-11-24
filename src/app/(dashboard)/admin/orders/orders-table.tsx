"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Search, Truck, CheckCircle, XCircle, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { updateOrderStatus, assignPharmacy } from "@/lib/admin-actions"
import { useToast } from "@/hooks/use-toast"

interface Order {
  id: number
  code: string
  created_at: string
  status: string
  total_price: number
  email: string | null
  pharmacy_id: number | null
  pharmacies: { name: string } | null
}

interface Pharmacy {
  id: number
  name: string
}

export function OrdersTable({ initialOrders, pharmacies }: { initialOrders: Order[], pharmacies: Pharmacy[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  const filteredOrders = initialOrders.filter(o => 
    o.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.email && o.email.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleStatusChange = async (id: number, status: string) => {
    const res = await updateOrderStatus(id, status)
    if (res.error) {
      toast({ variant: "destructive", title: "Error", description: res.error })
    } else {
      toast({ title: "Updated", description: `Order status changed to ${status}.` })
    }
  }

  const handleAssignPharmacy = async (orderId: number, pharmacyId: number) => {
    const res = await assignPharmacy(orderId, pharmacyId)
    if (res.error) {
      toast({ variant: "destructive", title: "Error", description: res.error })
    } else {
      toast({ title: "Assigned", description: "Pharmacy assigned successfully." })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-500">Completed</Badge>
      case 'processing': return <Badge className="bg-blue-500">Processing</Badge>
      case 'out_for_delivery': return <Badge className="bg-purple-500">Delivering</Badge>
      case 'pending_payment': return <Badge variant="secondary">Pending</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search orders..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Pharmacy</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.code}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(order.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>{order.email || 'Anonymous'}</TableCell>
                <TableCell>{getStatusBadge(order.status)}</TableCell>
                <TableCell>
                  {order.pharmacies?.name ? (
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      {order.pharmacies.name}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-xs italic">Unassigned</span>
                  )}
                </TableCell>
                <TableCell className="text-right">GHS {Number(order.total_price).toFixed(2)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>Update Status</DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          <DropdownMenuRadioGroup value={order.status} onValueChange={(val) => handleStatusChange(order.id, val)}>
                            <DropdownMenuRadioItem value="pending_payment">Pending Payment</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="received">Received</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="processing">Processing</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="out_for_delivery">Out for Delivery</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="completed">Completed</DropdownMenuRadioItem>
                          </DropdownMenuRadioGroup>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>

                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>Assign Pharmacy</DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          <DropdownMenuRadioGroup value={order.pharmacy_id?.toString()} onValueChange={(val) => handleAssignPharmacy(order.id, parseInt(val))}>
                            {pharmacies.map(p => (
                              <DropdownMenuRadioItem key={p.id} value={p.id.toString()}>
                                {p.name}
                              </DropdownMenuRadioItem>
                            ))}
                          </DropdownMenuRadioGroup>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>

                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filteredOrders.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
