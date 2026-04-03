"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  CheckCircle, 
  XCircle, 
  Truck, 
  Package, 
  Eye, 
  MapPin, 
  Clock, 
  Loader2,
  GanttChartSquare,
  MessageSquare,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OrderMessages } from "@/components/order-messages";
import { OrderDetailsSheet } from "./order-details-sheet";
import { DeliveryDialog } from "./delivery-dialog";

interface Order {
  id: number;
  code: string;
  created_at: string;
  status: string;
  pharmacy_ack_status?: string;
  total_price_ghs: number;
  items: any;
  delivery_area?: string;
}

interface OrdersListProps {
  orders: Order[];
  onOrderUpdate?: () => void;
}

export function OrdersList({ orders, onOrderUpdate }: OrdersListProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState<{
    id: number;
    action: string;
    success?: boolean;
  } | null>(null);
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [detailsSheetOpen, setDetailsSheetOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [hiddenOrderIds, setHiddenOrderIds] = useState<Set<number>>(new Set());

  // Chat Dialog State
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [activeChatOrderId, setActiveChatOrderId] = useState<number | null>(null);

  // Delivery Dialog State
  const [deliveryDialogOpen, setDeliveryDialogOpen] = useState(false);
  const [pendingDeliveryId, setPendingDeliveryId] = useState<number | null>(null);

  const handleOpenChat = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setActiveChatOrderId(id);
    setChatDialogOpen(true);
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setDetailsSheetOpen(true);
  };

  const handleOrderAction = async (
    id: number,
    action: string,
    data: any = {},
  ) => {
    // Optimistic UI: Immediately hide or update based on action
    if (action === "acknowledge") {
       setHiddenOrderIds(prev => new Set(prev).add(id));
    }

    // Only set loading for specific action if it's a button click (not internal)
    // We map 'acknowledge' -> 'accept'/'decline' based on data for better granularity
    let actionType = action;
    if (action === "acknowledge") {
      actionType =
        data.pharmacy_ack_status === "accepted" ? "accept" : "decline";
    } else if (action === "update_status") {
      actionType = data.status;
    }

    setLoading({ id, action: actionType });

    try {
      const res = await fetch(`/api/pharmacy/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...data }),
      });

      const result = await res.json();

      if (!res.ok) {
        // Rollback optimistic hide on error
        if (action === "acknowledge") {
           setHiddenOrderIds(prev => {
              const next = new Set(prev);
              next.delete(id);
              return next;
           });
        }
        throw new Error(result.error || "Failed to update order");
      }

      // Show specific success message based on action
      const messages: Record<string, { title: string; description: string }> = {
        accept: {
          title: "Order Accepted",
          description: "You can now prepare this order for delivery",
        },
        decline: {
          title: "Order Declined",
          description: "The order has been unassigned from your pharmacy",
        },
        out_for_delivery: {
          title: "Out for Delivery",
          description: "Customer will be notified of the shipment",
        },
        completed: {
          title: "Order Completed",
          description: "Great job! The order has been marked as delivered",
        },
      };

      const message = messages[actionType] || {
        title: "Success",
        description: "Order updated successfully",
      };
      toast({
        title: message.title,
        description: message.description,
      });

      // Trigger parent refetch
      onOrderUpdate?.();

      // Clear loading immediately after parent refetch is triggered
      setLoading(null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update order",
      });
      setLoading(null);
    }
  };

  const handleAccept = async (id: number) => {
    await handleOrderAction(id, "acknowledge", {
      pharmacy_ack_status: "accepted",
    });
  };

  const handleDeclineClick = (id: number) => {
    setSelectedId(id);
    setDeclineDialogOpen(true);
  };

  const handleDeclineConfirm = async () => {
    if (!selectedId || !declineReason.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide a reason",
      });
      return;
    }

    await handleOrderAction(selectedId, "acknowledge", {
      pharmacy_ack_status: "declined",
      note: declineReason,
    });

    setDeclineDialogOpen(false);
    setDeclineReason("");
    setSelectedId(null);
  };

  const handleMarkOutForDelivery = async (id: number) => {
    setPendingDeliveryId(id);
    setDeliveryDialogOpen(true);
  };

  const handleMarkCompleted = async (id: number) => {
    await handleOrderAction(id, "update_status", { status: "completed" });
    setDetailsSheetOpen(false);
  };

  const getStatusBadge = (status: string, ackStatus?: string) => {
    // New assignment - needs accept/decline
    if (status === "received" && ackStatus === "pending") {
      return (
        <Badge variant="info" className="gap-1.5 animate-breathing shadow-[0_4px_12px_rgba(14,165,233,0.3),inset_0_0_8px_rgba(14,165,233,0.2)] bg-sky-50 text-sky-700 border-sky-200/50 font-black uppercase text-[9px] tracking-widest px-2.5 py-1">
          <div className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse" />
          Queueing: Inbound
        </Badge>
      );
    }

    // Just accepted - preparing order
    if (status === "processing" && ackStatus === "accepted") {
      return (
        <Badge variant="success" className="gap-1.5 shadow-[inset_0_0_12px_rgba(99,102,241,0.2)] bg-indigo-50 text-brand-indigo border-indigo-100 font-black uppercase text-[9px] tracking-widest px-2.5 py-1">
          <Package className="h-3.5 w-3.5" />
          Internal Prep
        </Badge>
      );
    }

    const variants: Record<
      string,
      {
        variant: any;
        label: string;
        icon?: any;
        className?: string;
      }
    > = {
      received: { variant: "info", label: "New Inbound", className: "animate-breathing shadow-[0_4px_12px_rgba(14,165,233,0.2),inset_0_0_8px_rgba(14,165,233,0.3)] bg-sky-50 text-sky-700 border-sky-200/50 font-black uppercase text-[9px] tracking-widest px-2.5 py-1" },
      processing: { variant: "secondary", label: "Internal Prep", className: "shadow-[inset_0_0_12px_rgba(99,102,241,0.2)] bg-indigo-50 text-brand-indigo border-indigo-100 font-black uppercase text-[9px] tracking-widest px-2.5 py-1" },
      out_for_delivery: { variant: "warning", label: "Outbound Ops", className: "animate-breathing shadow-[0_4px_12px_rgba(245,158,11,0.2),inset_0_0_8px_rgba(245,158,11,0.3)] bg-amber-50 text-amber-700 border-amber-200/50 font-black uppercase text-[9px] tracking-widest px-2.5 py-1" },
      completed: { variant: "success", label: "Dispatch Done", className: "shadow-[inset_0_0_12px_rgba(34,197,94,0.3)] bg-emerald-50 text-emerald-700 border-emerald-100 font-black uppercase text-[9px] tracking-widest px-2.5 py-1" },
      cancelled: { variant: "destructive", label: "Aborted", className: "bg-rose-50 text-rose-600 border-rose-100 font-black uppercase text-[9px] tracking-widest px-2.5 py-1" },
    };
    const config = variants[status] || { variant: "secondary", label: status, className: "font-black uppercase text-[9px] tracking-widest" };
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No orders assigned yet</p>
      </div>
    );
  }

  // Filter out declined or optimistically hidden orders from the list
  const activeOrders = orders.filter(
    (o) => o.pharmacy_ack_status !== "declined" && !hiddenOrderIds.has(o.id),
  );

  if (activeOrders.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No active orders</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
        {activeOrders.map((order) => {
          const acceptLoading =
            loading?.id === order.id && loading?.action === "accept";
          const declineLoading =
            loading?.id === order.id && loading?.action === "decline";

          const items =
            typeof order.items === "string"
              ? JSON.parse(order.items)
              : order.items;
          const itemCount = Array.isArray(items) ? items.length : 0;

            const isLate = () => {
              if (order.status !== "processing") return false;
              const created = new Date(order.created_at).getTime();
              const now = new Date().getTime();
              return (now - created) / (1000 * 60) > 20;
            };

            const late = isLate();
            const isCompleted = order.status === "completed";

            return (
              <Card
                key={order.id}
                className={cn(
                  "p-5 shadow-none transition-all group border-slate-200 cursor-pointer hover:border-slate-300 hover:shadow-md",
                  isCompleted && "border-emerald-100 bg-emerald-50/30",
                  late && "animate-urgent border-rose-500 shadow-rose-100 bg-rose-50/10"
                )}
                onClick={() => handleViewDetails(order)}
              >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-slate-900 tracking-tighter text-lg">
                      {order.code}
                    </span>
                    {getStatusBadge(order.status, order.pharmacy_ack_status)}
                    {late && (
                      <Badge variant="destructive" className="animate-pulse px-1.5 py-0 text-[9px] font-black tracking-widest uppercase">URGENT</Badge>
                    )}
                  </div>
                  
                  <div className="text-[13px] font-medium text-slate-500 space-y-1.5 pl-4 border-l-2 border-slate-100">
                    <p className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      {order.delivery_area || "Not specified"}
                    </p>
                    <p className="flex items-center gap-2 font-bold text-slate-800">
                      <GanttChartSquare className="h-3.5 w-3.5 text-slate-400" />
                      {itemCount} Items • ₵{Number(order.total_price_ghs || 0).toFixed(2)}
                    </p>
                    <p className="text-[11px] flex items-center gap-2 opacity-60">
                      <Clock className="h-3.5 w-3.5" />
                      Received {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                  {order.status === "received" && order.pharmacy_ack_status === "pending" ? (
                    <>
                      <Button
                        size="lg"
                        className="h-12 px-8 bg-brand-teal hover:bg-brand-teal-dark font-black text-sm gap-2 shadow-sm shadow-brand-teal/20"
                        onClick={(e) => { e.stopPropagation(); handleAccept(order.id); }}
                        disabled={acceptLoading}
                      >
                        {acceptLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                        Accept Order
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="h-12 px-5 border-rose-100 text-rose-600 hover:bg-rose-50 font-bold text-sm gap-2"
                        onClick={(e) => { e.stopPropagation(); handleDeclineClick(order.id); }}
                        disabled={declineLoading}
                      >
                        <XCircle className="h-4 w-4" />
                        Decline
                      </Button>
                    </>
                  ) : order.status === "processing" ? (
                    <Button
                      size="lg"
                      className="h-12 px-10 bg-brand-teal hover:bg-brand-teal-dark font-black text-sm gap-2 shadow-sm shadow-brand-teal/20"
                      onClick={(e) => { e.stopPropagation(); handleMarkOutForDelivery(order.id); }}
                    >
                      <Truck className="h-5 w-5 animate-breathing" />
                      Dispatch Order
                    </Button>
                  ) : order.status === "out_for_delivery" ? (
                    <Button
                      size="lg"
                      className="h-12 px-10 bg-emerald-600 hover:bg-emerald-700 font-black text-sm gap-2 shadow-sm shadow-emerald-600/20"
                      onClick={(e) => { e.stopPropagation(); handleMarkCompleted(order.id); }}
                    >
                      <CheckCircle className="h-5 w-5" />
                      Confirm Delivery
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      variant="ghost"
                      className="h-12 px-8 text-slate-400 font-bold text-sm gap-2"
                      disabled
                    >
                      <CheckCircle className="h-5 w-5" />
                      Completed
                    </Button>
                  )}
                  
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => handleOpenChat(e, order.id)}
                    className="h-12 w-12 text-slate-400 hover:text-brand-indigo rounded-xl bg-slate-50/50 hover:bg-brand-indigo/5"
                  >
                    <MessageSquare className="h-5 w-5" />
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => { e.stopPropagation(); handleViewDetails(order); }}
                    className="h-12 w-12 text-slate-400 hover:text-slate-900 rounded-xl"
                  >
                    <Eye className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <AlertDialog open={declineDialogOpen} onOpenChange={setDeclineDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Decline Order</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for declining this order. This will be
              logged and the order will be unassigned from your pharmacy.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Reason for declining (e.g., out of stock, unable to fulfill)"
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            className="min-h-[100px]"
          />
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeclineReason("");
                setSelectedId(null);
              }}
            >
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
        onMarkOutForDelivery={() =>
          selectedOrder && handleMarkOutForDelivery(selectedOrder.id)
        }
        onMarkCompleted={() =>
          selectedOrder && handleMarkCompleted(selectedOrder.id)
        }
        loading={loading?.id === selectedOrder?.id}
        loadingAction={loading?.action}
      />

      <DeliveryDialog
        orderId={pendingDeliveryId}
        isOpen={deliveryDialogOpen}
        onOpenChange={setDeliveryDialogOpen}
        onSuccess={() => {
          onOrderUpdate?.();
          setDetailsSheetOpen(false); // Close details if open, to show list update or just refresh
        }}
      />

      {/* Chat Dialog */}
      <Dialog open={chatDialogOpen} onOpenChange={setChatDialogOpen}>
        <DialogContent className="sm:max-w-[500px] border-none bg-white p-0 overflow-hidden rounded-[2.5rem] shadow-2xl">
          <div className="p-8 border-b border-slate-50 bg-slate-50/30">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">Admin Support</DialogTitle>
              <DialogDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Direct support channel for real-time coordination.</DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-8 pb-10">
            {activeChatOrderId && (
              <OrderMessages orderId={activeChatOrderId} userRole="pharmacy" />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
