"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle, XCircle, Truck, Package, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
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
import { OrderDetailsSheet } from "./order-details-sheet"

interface Order {
  id: number
  code: string
  created_at: string
  status: string
  pharmacy_ack_status?: string
  total_price: number
  items: any
  delivery_area?: string
}

interface OrdersListProps {
  orders: Order[]
  onOrderUpdate?: () => void
}

export function OrdersList({ orders, onOrderUpdate }: OrdersListProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState<{ id: number; action: string } | null>(null)
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [declineReason, setDeclineReason] = useState("")
  const [detailsSheetOpen, setDetailsSheetOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order)
    setDetailsSheetOpen(true)
  }

  const handleOrderAction = async (id: number, action: string, data: any = {}) => {
    // Only set loading for specific action if it's a button click (not internal)
    // We map 'acknowledge' -> 'accept'/'decline' based on data for better granularity
    let actionType = action;
    if (action === 'acknowledge') {
      actionType = data.pharmacy_ack_status === 'accepted' ? 'accept' : 'decline';
    } else if (action === 'update_status') {
      actionType = data.status;
    }
    
    setLoading({ id, action: actionType })
    
    try {
      const res = await fetch(`/api/pharmacy/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...data })
      })
      
      const result = await res.json()
      
      if (!res.ok) {
        throw new Error(result.error || 'Failed to update order')
      }
      
      toast({ 
        title: "Success", 
        description: "Order updated successfully" 
      })
      
      onOrderUpdate?.()
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: error instanceof Error ? error.message : 'Failed to update order'
      })
    } finally {
      setLoading(null)
    }
  }

  const handleAccept = async (id: number) => {
    await handleOrderAction(id, 'acknowledge', { pharmacy_ack_status: 'accepted' })
  }

  const handleDeclineClick = (id: number) => {
    setSelectedId(id)
    setDeclineDialogOpen(true)
  }

  const handleDeclineConfirm = async () => {
    if (!selectedId || !declineReason.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Please provide a reason" })
      return
    }

    await handleOrderAction(selectedId, 'acknowledge', { 
      pharmacy_ack_status: 'declined',
      note: declineReason 
    })
    
    setDeclineDialogOpen(false)
    setDeclineReason("")
    setSelectedId(null)
  }

  const handleMarkOutForDelivery = async (id: number) => {
    await handleOrderAction(id, 'update_status', { status: 'out_for_delivery' })
  }

  const handleMarkCompleted = async (id: number) => {
    await handleOrderAction(id, 'update_status', { status: 'completed' })
    setDetailsSheetOpen(false)
  }

  const getStatusBadge = (status: string, ackStatus?: string) => {
    if (status === 'received' && ackStatus === 'pending') {
      return <Badge variant="info" className="gap-1"><div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />New Assignment</Badge>
    }
    
    const variants: Record<string, { variant: "secondary" | "default" | "destructive" | "outline" | "success" | "warning" | "info" | "neutral"; label: string; icon?: any }> = {
      received: { variant: "secondary", label: "Received" },
      processing: { variant: "info", label: "Processing" },
      out_for_delivery: { variant: "warning", label: "Out for Delivery" },
      completed: { variant: "success", label: "Completed" },
      cancelled: { variant: "destructive", label: "Cancelled" }
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
        <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
        {orders.map((order) => {
          const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items
          const itemCount = Array.isArray(items) ? items.length : 0

          return (
            <Card key={order.id} className="p-4 shadow-none border-border">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono font-semibold">{order.code}</span>
                    {getStatusBadge(order.status, order.pharmacy_ack_status)}
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Delivery: {order.delivery_area || 'Not specified'}</p>
                    <p>Items: {itemCount} • Total: GHS {Number(order.total_price || 0).toFixed(2)}</p>
                    <p className="text-xs">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewDetails(order)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  
                  {order.status === 'received' && order.pharmacy_ack_status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleAccept(order.id)}
                        disabled={loading?.id === order.id}
                      >
                        {loading?.id === order.id && loading?.action === 'accept' ? (
                           <div className="h-4 w-4 mr-1 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                           <CheckCircle className="h-4 w-4 mr-1" />
                        )}
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeclineClick(order.id)}
                        disabled={loading?.id === order.id}
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
                      disabled={loading?.id === order.id}
                    >
                      {loading?.id === order.id && loading?.action === 'out_for_delivery' ? (
                        <div className="h-4 w-4 mr-1 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <Truck className="h-4 w-4 mr-1" />
                      )}
                      Out for Delivery
                    </Button>
                  )}

                  {order.status === 'out_for_delivery' && (
                    <Button
                      size="sm"
                      onClick={() => handleMarkCompleted(order.id)}
                      disabled={loading?.id === order.id}
                    >
                      {loading?.id === order.id && loading?.action === 'completed' ? (
                        <div className="h-4 w-4 mr-1 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-1" />
                      )}
                      Mark Completed
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
              setSelectedId(null)
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeclineConfirm}>
              Confirm Decline
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <OrderDetailsSheet
        order={selectedOrder}
        open={detailsSheetOpen}
        onOpenChange={setDetailsSheetOpen}
        onAccept={() => selectedOrder && handleAccept(selectedOrder.id)}
        onDecline={() => selectedOrder && handleDeclineClick(selectedOrder.id)}
        onMarkOutForDelivery={() => selectedOrder && handleMarkOutForDelivery(selectedOrder.id)}
        onMarkCompleted={() => selectedOrder && handleMarkCompleted(selectedOrder.id)}
        loading={loading?.id === selectedOrder?.id}
      />
    </>
  )
}
