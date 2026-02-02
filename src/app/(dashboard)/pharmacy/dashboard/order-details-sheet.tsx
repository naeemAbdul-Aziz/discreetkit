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
import { OrderMessages } from "@/components/order-messages"

interface OrderDetailsSheetProps {
  order: any | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAccept?: () => void
  onDecline?: () => void
  onMarkOutForDelivery?: () => void
  onMarkCompleted?: () => void
  loading?: boolean
  loadingAction?: string
}

export function OrderDetailsSheet({
  order,
  open,
  onOpenChange,
  onAccept,
  onDecline,
  onMarkOutForDelivery,
  onMarkCompleted,
  loading,
  loadingAction
}: OrderDetailsSheetProps) {
  if (!order) return null

  const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items
  const itemsArray = Array.isArray(items) ? items : []

  const getStatusBadge = (status: string, ackStatus?: string) => {
    // Show "Preparing" when just accepted
    if (status === 'processing' && ackStatus === 'accepted') {
      return <Badge variant="success" className="gap-1"><Package className="h-3 w-3" />Preparing Order</Badge>
    }
    
    const variants: Record<string, { variant: "secondary" | "default" | "destructive" | "outline" | "success" | "warning" | "info" | "neutral"; label: string }> = {
      received: { variant: "secondary", label: "New" },
      processing: { variant: "info", label: "Preparing" },
      out_for_delivery: { variant: "warning", label: "Out for Delivery" },
      completed: { variant: "success", label: "Delivered" }
    }
    const config = variants[status] || { variant: "neutral", label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <span className="font-mono">{order.code}</span>
            {getStatusBadge(order.status, order.pharmacy_ack_status)}
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

          
          {/* Status Stepper */}
          <div className="w-full py-4">
            <div className="relative flex items-center justify-between w-full">
              <div className="absolute left-0 top-1/2 w-full h-1 bg-muted -z-10" />
              <div className={`absolute left-0 top-1/2 h-1 bg-primary -z-10 transition-all duration-500 ease-in-out`}
                style={{ 
                  width: order.status === 'completed' ? '100%' : 
                         order.status === 'out_for_delivery' ? '66%' : 
                         (order.status === 'processing' && order.pharmacy_ack_status === 'accepted') ? '33%' : '0%' 
                }} 
              />
              
              {[
                { id: 'start', label: 'Received', icon: CheckCircle, active: true },
                { id: 'processing', label: 'Preparing', icon: Package, active: ['processing', 'out_for_delivery', 'completed'].includes(order.status) && (order.status !== 'received' || order.pharmacy_ack_status === 'accepted') },
                { id: 'delivery', label: 'Delivery', icon: Truck, active: ['out_for_delivery', 'completed'].includes(order.status) },
                { id: 'end', label: 'Delivered', icon: CheckCircle, active: order.status === 'completed' }
              ].map((step, idx) => (
                <div key={idx} className="flex flex-col items-center bg-background px-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${step.active ? 'bg-primary border-primary text-primary-foreground' : 'bg-muted border-muted-foreground/30 text-muted-foreground'}`}>
                    <step.icon className="h-4 w-4" />
                  </div>
                  <span className={`text-xs mt-2 font-medium ${step.active ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</span>
                </div>
              ))}
            </div>
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
                    GHS {(Number(item.price_ghs || item.price || 0) * Number(item.quantity || 1)).toFixed(2)}
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
              <span>GHS {Number(order.subtotal || 0).toFixed(2)}</span>
            </div>
            {order.student_discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Student Discount</span>
                <span className="text-green-600">-GHS {Number(order.student_discount || 0).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span>GHS {Number(order.delivery_fee || 0).toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span className="text-lg">GHS {Number(order.total_price || 0).toFixed(2)}</span>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-2">
            {order.status === 'received' && order.pharmacy_ack_status === 'pending' && (
              <>
                {(() => {
                  const isAcceptLoading = !!(loading && loadingAction === 'accept');
                  return (
                    <Button
                      className="w-full"
                      onClick={onAccept}
                      loading={isAcceptLoading}
                    >
                      {!isAcceptLoading && <CheckCircle className="h-4 w-4 mr-2" />}
                      Accept Order
                    </Button>
                  );
                })()}
                <Button
                  className="w-full"
                  variant="destructive"
                  onClick={onDecline}
                  loading={!!(loading && loadingAction === 'decline')}
                >
                  {!(loading && loadingAction === 'decline') && (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  Decline Order
                </Button>
              </>
            )}

            {order.status === 'processing' && (
              (() => {
                const isOutForDeliveryLoading = !!(loading && loadingAction === 'out_for_delivery');
                return (
                  <Button
                    className="w-full"
                    onClick={onMarkOutForDelivery}
                    loading={isOutForDeliveryLoading}
                  >
                    {!isOutForDeliveryLoading && <Truck className="h-4 w-4 mr-2" />}
                    Mark Out for Delivery
                  </Button>
                );
              })()
            )}

            {order.status === 'out_for_delivery' && (
              (() => {
                const isCompletedLoading = !!(loading && loadingAction === 'completed');
                return (
                  <Button
                    className="w-full"
                    onClick={onMarkCompleted}
                    loading={isCompletedLoading}
                  >
                    {!isCompletedLoading && <CheckCircle className="h-4 w-4 mr-2" />}
                    Confirm Delivery
                  </Button>
                );
              })()
            )}
          </div>

          {/* Order Messages */}
          <Separator />
          <OrderMessages orderId={order.id} userRole="pharmacy" />
        </div>
      </SheetContent>
    </Sheet>
  )
}
