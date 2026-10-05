"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("incoming");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
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

      // Trigger parent refetch or router refresh
      if (onOrderUpdate) {
        onOrderUpdate();
      } else {
        router.refresh();
      }

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
        <Badge className="gap-1.5 bg-blue-50 text-blue-700 hover:bg-blue-50 border-none font-medium text-[11px] px-3 py-1 shadow-none pointer-events-none rounded-full">
          <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          Queueing
        </Badge>
      );
    }

    // Just accepted - preparing order
    if (status === "processing" && ackStatus === "accepted") {
      return (
        <Badge className="gap-1.5 bg-purple-50 text-purple-700 hover:bg-purple-50 border-none font-medium text-[11px] px-3 py-1 shadow-none pointer-events-none rounded-full">
          <Icon name="inventory_2" opticalSize={14} />
          Internal Prep
        </Badge>
      );
    }

    const variants: Record<
      string,
      {
        label: string;
        icon?: any;
        className?: string;
      }
    > = {
      received: { 
        label: "New Inbound", 
        className: "bg-blue-50 text-blue-700 border-none hover:bg-blue-50 font-medium text-[11px] px-3 py-1 shadow-none pointer-events-none rounded-full" 
      },
      processing: { 
        label: "Internal Prep", 
        className: "bg-purple-50 text-purple-700 border-none hover:bg-purple-50 font-medium text-[11px] px-3 py-1 shadow-none pointer-events-none rounded-full" 
      },
      out_for_delivery: { 
        label: "Outbound", 
        className: "bg-orange-50 text-orange-700 border-none hover:bg-orange-50 font-medium text-[11px] px-3 py-1 shadow-none pointer-events-none rounded-full" 
      },
      completed: { 
        label: "Completed", 
        className: "bg-green-50 text-green-700 border-none hover:bg-green-50 font-medium text-[11px] px-3 py-1 shadow-none pointer-events-none rounded-full" 
      },
      cancelled: { 
        label: "Aborted", 
        className: "bg-red-50 text-red-700 border-none hover:bg-red-50 font-medium text-[11px] px-3 py-1 shadow-none pointer-events-none rounded-full" 
      },
    };
    const config = variants[status] || { label: status, className: "font-medium text-[11px] px-3 py-1 border-none bg-gray-100 text-gray-600 hover:bg-gray-100 shadow-none pointer-events-none rounded-full" };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Icon name="inventory_2" opticalSize={48} className="mx-auto mb-4 opacity-50 text-slate-300" />
        <p>No orders assigned yet</p>
      </div>
    );
  }

  const activeOrders = orders.filter(
    (o) => o.pharmacy_ack_status !== "declined" && !hiddenOrderIds.has(o.id),
  );

  const queueOrders = activeOrders.filter(o => o.status === "received" && o.pharmacy_ack_status === "pending");
  const processingOrders = activeOrders.filter(o => o.status === "processing" || (o.status === "received" && o.pharmacy_ack_status === "accepted"));
  const inTransitOrders = activeOrders.filter(o => o.status === "out_for_delivery");
  const completedOrders = activeOrders.filter(o => o.status === "completed");

  const renderPaginatedList = (list: Order[], emptyMessage: string, emptyIconName: string) => {
    if (list.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-24 bg-[#f8f9fa] rounded-[32px] border-none">
          <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
            <Icon name={emptyIconName} opticalSize={32} className="text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-500 tracking-tight">{emptyMessage}</p>
        </div>
      );
    }

    const totalPages = Math.ceil(list.length / ITEMS_PER_PAGE);
    const paginatedList = list.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
      <div className="space-y-4">
        {paginatedList.map(order => <OrderCard key={order.id} order={order} />)}
        
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 pb-2 px-2">
            <p className="text-xs font-medium text-slate-500">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, list.length)} of {list.length}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8 rounded-lg text-xs"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-8 rounded-lg text-xs"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const OrderCard = ({ order }: { order: Order }) => {
    const acceptLoading = loading?.id === order.id && loading?.action === "accept";
    const declineLoading = loading?.id === order.id && loading?.action === "decline";

    const items = typeof order.items === "string" ? JSON.parse(order.items) : order.items;
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
        className="p-6 shadow-none border-none bg-[#f8f9fa] hover:bg-[#f1f3f4] transition-colors rounded-[24px] cursor-pointer"
        onClick={() => handleViewDetails(order)}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <span className="font-sans font-medium text-gray-900 tracking-tight text-xl">
                {order.code}
              </span>
              {(activeTab === "all" || order.status === "completed") && getStatusBadge(order.status, order.pharmacy_ack_status)}
              {late && (
                <Badge className="bg-red-50 text-red-700 border-none hover:bg-red-50 px-2 py-0.5 text-[11px] font-medium tracking-wide shadow-none pointer-events-none rounded-full">URGENT</Badge>
              )}
            </div>
            
            <div className="text-[14px] font-normal text-gray-600 space-y-2">
              <p className="flex items-center gap-2">
                <Icon name="location_on" className="text-gray-400" opticalSize={16} />
                {order.delivery_area || "Not specified"}
              </p>
              <p className="flex items-center gap-2 font-medium text-gray-900">
                <Icon name="list_alt" className="text-gray-400" opticalSize={16} />
                {itemCount} Items • ₵{Number(order.total_price_ghs || 0).toFixed(2)}
              </p>
              <p className="text-[12px] flex items-center gap-2 text-gray-500">
                <Icon name="schedule" opticalSize={14} />
                Received {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(order.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 mt-2 md:mt-0">
            {order.status === "received" && order.pharmacy_ack_status === "pending" ? (
              <>
                <Button
                  size="lg"
                  className="h-12 px-8 rounded-full bg-[#1a1a1a] hover:bg-[#333] text-white font-medium text-sm gap-2 shadow-none"
                  onClick={(e) => { e.stopPropagation(); handleAccept(order.id); }}
                  disabled={acceptLoading}
                >
                  {acceptLoading ? <Icon name="progress_activity" className="animate-spin" opticalSize={16} /> : <Icon name="check_circle" opticalSize={16} fill />}
                  Accept
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 rounded-full border-none bg-transparent hover:bg-gray-200 text-gray-700 font-medium text-sm gap-2"
                  onClick={(e) => { e.stopPropagation(); handleDeclineClick(order.id); }}
                  disabled={declineLoading}
                >
                  <Icon name="cancel" opticalSize={16} />
                  Decline
                </Button>
              </>
            ) : order.status === "processing" ? (
              <Button
                size="lg"
                className="h-12 px-8 rounded-full bg-[#1a1a1a] hover:bg-[#333] text-white font-medium text-sm gap-2 shadow-none"
                onClick={(e) => { e.stopPropagation(); handleMarkOutForDelivery(order.id); }}
              >
                <Icon name="local_shipping" opticalSize={20} />
                Dispatch
              </Button>
            ) : order.status === "out_for_delivery" ? (
              <Button
                size="lg"
                className="h-12 px-8 rounded-full bg-green-700 hover:bg-green-800 text-white font-medium text-sm gap-2 shadow-none"
                onClick={(e) => { e.stopPropagation(); handleMarkCompleted(order.id); }}
              >
                <Icon name="check_circle" opticalSize={20} fill />
                Confirm Delivery
              </Button>
            ) : (
              <Button
                size="lg"
                variant="ghost"
                className="h-12 px-8 rounded-full text-gray-500 font-medium text-sm gap-2 hover:bg-transparent"
                disabled
              >
                <Icon name="check_circle" opticalSize={20} />
                Completed
              </Button>
            )}
            
            <div className="flex gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => { e.stopPropagation(); handleOpenChat(e, order.id); }}
                className="h-12 w-12 rounded-full text-gray-500 hover:text-gray-900 bg-transparent hover:bg-gray-200"
              >
                <Icon name="chat" opticalSize={20} />
              </Button>

              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => { e.stopPropagation(); handleViewDetails(order); }}
                className="h-12 w-12 rounded-full text-gray-500 hover:text-gray-900 bg-transparent hover:bg-gray-200"
              >
                <Icon name="visibility" opticalSize={20} />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <>
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setCurrentPage(1); }} className="w-full space-y-8">
        <div className="flex items-center justify-start w-full overflow-x-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <TabsList className="bg-[#f8f9fa] p-1.5 rounded-full h-14 flex items-center gap-1 w-auto min-w-max border-none shadow-none">
            <TabsTrigger 
              value="incoming" 
              onClick={(e) => e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })}
              className="rounded-full px-6 h-11 font-medium text-[13px] tracking-wide transition-all data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-500 hover:text-gray-900 whitespace-nowrap shrink-0 border-none"
            >
              Incoming
              {queueOrders.length > 0 && (
                <span className="ml-2 h-5 min-w-[1.25rem] px-1.5 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 text-[11px] font-medium">
                  {queueOrders.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="preparing" 
              onClick={(e) => e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })}
              className="rounded-full px-6 h-11 font-medium text-[13px] tracking-wide transition-all data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-500 hover:text-gray-900 whitespace-nowrap shrink-0 border-none"
            >
              Preparing
              {processingOrders.length > 0 && (
                <span className="ml-2 h-5 min-w-[1.25rem] px-1.5 flex items-center justify-center rounded-full bg-purple-100 text-purple-700 text-[11px] font-medium">
                  {processingOrders.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="outbound" 
              onClick={(e) => e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })}
              className="rounded-full px-6 h-11 font-medium text-[13px] tracking-wide transition-all data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-500 hover:text-gray-900 whitespace-nowrap shrink-0 border-none"
            >
              Outbound
            </TabsTrigger>
            <TabsTrigger 
              value="completed" 
              onClick={(e) => e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })}
              className="rounded-full px-6 h-11 font-medium text-[13px] tracking-wide transition-all data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-500 hover:text-gray-900 whitespace-nowrap shrink-0 border-none"
            >
              Completed
            </TabsTrigger>
            <TabsTrigger 
              value="all" 
              onClick={(e) => e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })}
              className="rounded-full px-6 h-11 font-medium text-[13px] tracking-wide transition-all data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-500 hover:text-gray-900 whitespace-nowrap shrink-0 border-none"
            >
              All
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="incoming" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-500 focus-visible:outline-none">
          {renderPaginatedList(queueOrders, "No Incoming Requests", "schedule")}
        </TabsContent>

        <TabsContent value="preparing" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-500 focus-visible:outline-none">
          {renderPaginatedList(processingOrders, "Nothing in Preparation", "inventory_2")}
        </TabsContent>

        <TabsContent value="outbound" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-500 focus-visible:outline-none">
          {renderPaginatedList(inTransitOrders, "No Outbound Operations", "local_shipping")}
        </TabsContent>

        <TabsContent value="completed" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-500 focus-visible:outline-none">
          {renderPaginatedList(completedOrders, "No Dispatch History", "check_circle")}
        </TabsContent>

        <TabsContent value="all" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-500 focus-visible:outline-none">
          {renderPaginatedList(activeOrders, "No Records Found", "info")}
        </TabsContent>
      </Tabs>

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
