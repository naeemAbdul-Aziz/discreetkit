"use client"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Package, MapPin, Calendar, DollarSign, CheckCircle, XCircle, Truck } from "lucide-react"

interface OrderDetailsSheetProps {
  order: any | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAccept?: () => void
  onDecline?: () => void
  onMarkOutForDelivery?: () => void
  onMarkCompleted?: () => void
  loading?: boolean
}

export function OrderDetailsSheet({
  order,
  open,
  onOpenChange,
  onAccept,
  onDecline,
  onMarkOutForDelivery,
  onMarkCompleted,
  loading
}: OrderDetailsSheetProps) {
  if (!order) return null

  const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items
  const itemsArray = Array.isArray(items) ? items : []

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string; label: string }> = {
      received: { className: "bg-orange-500", label: "New" },
      processing: { className: "bg-blue-500", label: "Processing" },
      out_for_delivery: { className: "bg-purple-500", label: "Out for Delivery" },
      completed: { className: "bg-green-500", label: "Completed" }
    }
    const config = variants[status] || { className: "bg-gray-500", label: status }
    return <Badge className={config.className}>{config.label}</Badge>
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <span className="font-mono">{order.code}</span>
            {getStatusBadge(order.status)}
          </SheetTitle>
          <SheetDescription>
            Order details and management
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Order Info */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Order Date</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(order.created_at).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Delivery Area</p>
                <p className="text-sm text-muted-foreground">{order.delivery_area}</p>
                {order.delivery_address_note && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Note: {order.delivery_address_note}
                  </p>
                )}
              </div>
            </div>

            {order.phone_masked && (
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Contact</p>
                  <p className="text-sm text-muted-foreground">{order.phone_masked}</p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Order Items */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Order Items ({itemsArray.length})
            </h3>
            <div className="space-y-2">
              {itemsArray.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-start p-3 rounded-lg bg-muted/50">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-sm">
                    GHS {(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Order Summary */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>GHS {order.subtotal?.toFixed(2) || '0.00'}</span>
            </div>
            {order.student_discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Student Discount</span>
                <span className="text-green-600">-GHS {order.student_discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span>GHS {order.delivery_fee?.toFixed(2) || '0.00'}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span className="text-lg">GHS {order.total_price.toFixed(2)}</span>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-2">
            {order.status === 'received' && order.pharmacy_ack_status === 'pending' && (
              <>
                <Button
                  className="w-full"
                  onClick={onAccept}
                  disabled={loading}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Accept Order
                </Button>
                <Button
                  className="w-full"
                  variant="destructive"
                  onClick={onDecline}
                  disabled={loading}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Decline Order
                </Button>
              </>
            )}

            {order.status === 'processing' && (
              <Button
                className="w-full"
                onClick={onMarkOutForDelivery}
                disabled={loading}
              >
                <Truck className="h-4 w-4 mr-2" />
                Mark Out for Delivery
              </Button>
            )}

            {order.status === 'out_for_delivery' && (
              <Button
                className="w-full"
                onClick={onMarkCompleted}
                disabled={loading}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Completed
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
