"use client"

import { useState, useEffect } from "react"
import { useRealtimeOrders } from "@/hooks/use-realtime-orders"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle, XCircle, Truck, Package } from "lucide-react"
import { acceptOrder, declineOrder, updatePharmacyOrderStatus } from "@/lib/pharmacy-actions"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"

interface Order {
  id: number
  code: string
  created_at: string
  status: string
  delivery_area: string
  total_price: number
  items: any
  pharmacy_ack_status: string
}

export function OrdersList({ orders: initialOrders, pharmacyId }: { orders: Order[], pharmacyId: number }) {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState<number | null>(null)
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const [declineReason, setDeclineReason] = useState("")
  const [orders, setOrders] = useState<Order[]>(initialOrders)

  useRealtimeOrders(pharmacyId, setOrders)

  const handleAccept = async (orderId: number) => {
    setLoading(orderId)
    const res = await acceptOrder(orderId)
    
    if (res.error) {
      toast({ variant: "destructive", title: "Error", description: res.error })
    } else {
      toast({ title: "Order Accepted", description: "Order moved to processing" })
      router.refresh()
    }
    setLoading(null)
  }

  const handleDeclineClick = (orderId: number) => {
    setSelectedOrderId(orderId)
    setDeclineDialogOpen(true)
  }

  const handleDeclineConfirm = async () => {
    if (!selectedOrderId || !declineReason.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Please provide a reason" })
      return
    }

    setLoading(selectedOrderId)
    const res = await declineOrder(selectedOrderId, declineReason)
    
    if (res.error) {
      toast({ variant: "destructive", title: "Error", description: res.error })
    } else {
      toast({ title: "Order Declined", description: "Order unassigned from your pharmacy" })
      router.refresh()
    }
    
    setLoading(null)
    setDeclineDialogOpen(false)
    setDeclineReason("")
    setSelectedOrderId(null)
  }

  const handleMarkOutForDelivery = async (orderId: number) => {
    setLoading(orderId)
    const res = await updatePharmacyOrderStatus(orderId, 'out_for_delivery')
    
    if (res.error) {
      toast({ variant: "destructive", title: "Error", description: res.error })
    } else {
      toast({ title: "Status Updated", description: "Order marked as out for delivery" })
      router.refresh()
    }
    setLoading(null)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      received: { variant: "secondary", label: "New" },
      processing: { variant: "default", label: "Processing" },
      out_for_delivery: { variant: "default", label: "Out for Delivery" },
      completed: { variant: "outline", label: "Completed" }
    }
    const config = variants[status] || { variant: "secondary", label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No orders assigned yet</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {orders.map((order) => {
          const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items
          const itemCount = Array.isArray(items) ? items.length : 0

          return (
            <Card key={order.id} className="p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono font-semibold">{order.code}</span>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Delivery: {order.delivery_area}</p>
                    <p>Items: {itemCount} • Total: GHS {order.total_price.toFixed(2)}</p>
                    <p className="text-xs">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {order.status === 'received' && order.pharmacy_ack_status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleAccept(order.id)}
                        disabled={loading === order.id}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeclineClick(order.id)}
                        disabled={loading === order.id}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Decline
                      </Button>
                    </>
                  )}

                  {order.status === 'processing' && (
                    <Button
                      size="sm"
                      onClick={() => handleMarkOutForDelivery(order.id)}
                      disabled={loading === order.id}
                    >
                      <Truck className="h-4 w-4 mr-1" />
                      Mark Out for Delivery
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <AlertDialog open={declineDialogOpen} onOpenChange={setDeclineDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Decline Order</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for declining this order. This will be logged and the order will be unassigned from your pharmacy.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Reason for declining (e.g., out of stock, unable to fulfill)"
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            className="min-h-[100px]"
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeclineReason("")
              setSelectedOrderId(null)
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeclineConfirm}>
              Confirm Decline
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
