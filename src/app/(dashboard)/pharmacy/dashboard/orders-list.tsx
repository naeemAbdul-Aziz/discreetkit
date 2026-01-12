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
import { DeliveryDialog } from "./delivery-dialog"

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
  const [loading, setLoading] = useState<{ id: number; action: string; success?: boolean } | null>(null)
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [declineReason, setDeclineReason] = useState("")
  const [detailsSheetOpen, setDetailsSheetOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  
  // Delivery Dialog State
  const [deliveryDialogOpen, setDeliveryDialogOpen] = useState(false)
  const [pendingDeliveryId, setPendingDeliveryId] = useState<number | null>(null)

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
      
      // Show specific success message based on action
      const messages: Record<string, { title: string; description: string }> = {
        accept: { title: "Order Accepted", description: "You can now prepare this order for delivery" },
        decline: { title: "Order Declined", description: "The order has been unassigned from your pharmacy" },
        out_for_delivery: { title: "Out for Delivery", description: "Customer will be notified of the shipment" },
        completed: { title: "Order Completed", description: "Great job! The order has been marked as delivered" }
      }
      
      const message = messages[actionType] || { title: "Success", description: "Order updated successfully" }
      toast({ 
        title: message.title, 
        description: message.description 
      })
      
      // Trigger parent refetch
      onOrderUpdate?.()
      
      // Clear loading immediately after parent refetch is triggered
      setLoading(null)
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: error instanceof Error ? error.message : 'Failed to update order'
      })
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
    setPendingDeliveryId(id)
    setDeliveryDialogOpen(true)
  }

  const handleMarkCompleted = async (id: number) => {
    await handleOrderAction(id, 'update_status', { status: 'completed' })
    setDetailsSheetOpen(false)
  }

  const getStatusBadge = (status: string, ackStatus?: string) => {
    // New assignment - needs accept/decline
    if (status === 'received' && ackStatus === 'pending') {
      return <Badge variant="info" className="gap-1"><div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />New Assignment</Badge>
    }
    
    // Just accepted - preparing order
    if (status === 'processing' && ackStatus === 'accepted') {
      return <Badge variant="success" className="gap-1"><Package className="h-3 w-3" />Preparing Order</Badge>
    }
    
    const variants: Record<string, { variant: "secondary" | "default" | "destructive" | "outline" | "success" | "warning" | "info" | "neutral"; label: string; icon?: any }> = {
      received: { variant: "secondary", label: "Received" },
      processing: { variant: "info", label: "Preparing" },
      out_for_delivery: { variant: "warning", label: "Out for Delivery" },
      completed: { variant: "success", label: "Delivered" },
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

  // Filter out declined orders from the list
  const activeOrders = orders.filter(o => o.pharmacy_ack_status !== 'declined')

  if (activeOrders.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No active orders</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
        {activeOrders.map((order) => {
          const acceptLoading = loading?.id === order.id && loading?.action === 'accept'
          const declineLoading = loading?.id === order.id && loading?.action === 'decline'

          const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items
          const itemCount = Array.isArray(items) ? items.length : 0

          const isCompleted = order.status === 'completed'
          
          return (
            <Card key={order.id} className={`p-4 shadow-none transition-all ${isCompleted ? 'border-green-200 bg-green-50/30 dark:bg-green-950/10' : 'border-border'}`}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {isCompleted && <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />}
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

                <div className="flex gap-2 flex-wrap items-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewDetails(order)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Details
                  </Button>
                  
                  {/* Action Buttons based on Status */}
                  {order.status === 'received' && order.pharmacy_ack_status === 'pending' ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleAccept(order.id)}
                        disabled={acceptLoading || declineLoading}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                         {acceptLoading ? <div className="h-4 w-4 mr-1 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeclineClick(order.id)}
                        disabled={acceptLoading || declineLoading}
                      >
                         <XCircle className="h-4 w-4 mr-1" />
                        Decline
                      </Button>
                    </>
                  ) : (order.status === 'processing' && order.pharmacy_ack_status === 'accepted') ? (
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => handleMarkOutForDelivery(order.id)}
                      disabled={loading?.id === order.id}
                    >
                      {loading?.id === order.id && loading?.action === 'out_for_delivery' ? (
                        <div className="h-4 w-4 mr-1 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <Truck className="h-4 w-4 mr-1" />
                      )}
                      Mark Out for Delivery
                    </Button>
                  ) : order.status === 'out_for_delivery' ? (
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleMarkCompleted(order.id)}
                      disabled={loading?.id === order.id}
                    >
                      {loading?.id === order.id && loading?.action === 'completed' ? (
                        <div className="h-4 w-4 mr-1 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-1" />
                      )}
                      Confirm Delivery
                    </Button>
                  ) : null}
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
        loadingAction={loading?.action}
      />

      <DeliveryDialog
        orderId={pendingDeliveryId}
        isOpen={deliveryDialogOpen}
        onOpenChange={setDeliveryDialogOpen}
        onSuccess={() => {
            onOrderUpdate?.()
            setDetailsSheetOpen(false) // Close details if open, to show list update or just refresh
        }}
      />
    </>
  )
}
