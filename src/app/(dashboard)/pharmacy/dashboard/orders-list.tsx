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
  Info,
  ShieldCheck,
  Terminal,
  Zap,
  Activity,
  History,
  Map,
  Repeat,
  ArrowRight,
  ShieldAlert
} from "lucide-react";
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
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("incoming");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
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
    if (action === "acknowledge") {
       setHiddenOrderIds(prev => new Set(prev).add(id));
    }

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
        if (action === "acknowledge") {
           setHiddenOrderIds(prev => {
              const next = new Set(prev);
              next.delete(id);
              return next;
           });
        }
        throw new Error(result.error || "Failed to update order");
      }

      const messages: Record<string, { title: string; description: string }> = {
        accept: {
          title: "PROTOCOL_ACCEPTED",
          description: "Syncing fulfillment stream to active state.",
        },
        decline: {
          title: "PROTOCOL_DECLINED",
          description: "Node unassigned. Redirecting stream back to root.",
        },
        out_for_delivery: {
          title: "STREAM_TRANSIT",
          description: "Logistics node provisioned and in motion.",
        },
        completed: {
          title: "STREAM_FINALIZED",
          description: "Fulfillment confirmed. Logging to history.",
        },
      };

      const message = messages[actionType] || {
        title: "SYNC_SUCCESS",
        description: "Node registry updated successfully.",
      };
      toast({
        title: message.title,
        description: message.description,
      });

      onOrderUpdate?.();
      setLoading(null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "PROTOCOL_FAILURE",
        description:
          error instanceof Error ? error.message : "Sync failure in stream update.",
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
        title: "INPUT_FAILURE",
        description: "Operational reason required for protocol rejection.",
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
    if (status === "received" && ackStatus === "pending") {
      return (
        <div className="flex items-center gap-3 px-5 py-2 rounded-full bg-slate-50 text-slate-400 border border-slate-100 shadow-sm">
          <div className="h-2 w-2 rounded-full bg-slate-300" />
          <span className="text-[10px] font-black uppercase tracking-widest">INCOMING_QUEUE</span>
        </div>
      );
    }

    if (status === "processing" && ackStatus === "accepted") {
      return (
        <div className="flex items-center gap-3 px-5 py-2 rounded-full bg-brand-teal/10 text-brand-teal border border-brand-teal/20 shadow-sm">
          <Package className="h-4 w-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">STAGING_READY</span>
        </div>
      );
    }

    const variants: Record<string, { label: string; color: string; icon?: any }> = {
      received: { label: "INBOUND", color: "bg-slate-50 text-slate-400" },
      processing: { label: "STAGING", color: "bg-brand-teal/10 text-brand-teal", icon: Package },
      out_for_delivery: { label: "TRANSIT", color: "bg-amber-50 text-amber-600", icon: Truck },
      completed: { label: "FINALIZED", color: "bg-emerald-50 text-emerald-600", icon: ShieldCheck },
      cancelled: { label: "ABORTED", color: "bg-rose-50 text-rose-500", icon: XCircle },
    };
    const config = variants[status] || { label: status.toUpperCase(), color: "border border-slate-100 text-slate-300" };
    return (
      <div className={cn("flex items-center gap-3 px-5 py-2 rounded-full shadow-sm", config.color)}>
        {config.icon && <config.icon className="h-4 w-4" />}
        <span className="text-[10px] font-black uppercase tracking-widest">{config.label}</span>
      </div>
    );
  };

  const activeOrders = orders.filter(
    (o) => o.pharmacy_ack_status !== "declined" && !hiddenOrderIds.has(o.id),
  );

  const queueOrders = activeOrders.filter(o => o.status === "received" && o.pharmacy_ack_status === "pending");
  const processingOrders = activeOrders.filter(o => o.status === "processing" || (o.status === "received" && o.pharmacy_ack_status === "accepted"));
  const inTransitOrders = activeOrders.filter(o => o.status === "out_for_delivery");
  const completedOrders = activeOrders.filter(o => o.status === "completed");

  const renderPaginatedList = (list: Order[], emptyMessage: string, EmptyIcon: any) => {
    if (list.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-60 bg-slate-50/20 rounded-3xl border border-dashed border-slate-100">
          <div className="h-24 w-24 rounded-3xl bg-white border border-slate-100 flex items-center justify-center shadow-2xl shadow-slate-900/5 mb-10">
            <EmptyIcon className="h-12 w-12 text-slate-100" />
          </div>
          <div className="text-center space-y-4">
            <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none">MATRIX_SCAN_NOMINAL</h3>
            <p className="text-[10px] font-black text-slate-200 uppercase tracking-widest leading-none">{emptyMessage.toUpperCase()}</p>
          </div>
        </div>
      );
    }

    const totalPages = Math.ceil(list.length / ITEMS_PER_PAGE);
    const paginatedList = list.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
      <div className="space-y-6">
        <div className="grid gap-6">
            {paginatedList.map(order => <OrderCard key={order.id} order={order} />)}
        </div>
        
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-16 px-2">
            <div className="flex items-center gap-6">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-300">FRAME_DENSITY</span>
                <div className="h-12 px-8 rounded-full bg-slate-50 border border-slate-100 flex items-center text-[11px] font-black text-slate-900 tabular-nums shadow-sm">
                    {Math.min(currentPage * ITEMS_PER_PAGE, list.length)} / {list.length}
                </div>
            </div>
            <div className="flex items-center gap-6">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-14 rounded-full font-black text-[11px] uppercase tracking-widest px-10 border-slate-100 text-slate-400 hover:bg-slate-900 hover:text-white transition-none shadow-sm"
              >
                PREVIOUS_FRAME
              </Button>
              <div className="flex items-center gap-4 px-8 h-14 bg-slate-50/50 rounded-2xl border border-slate-100 shadow-sm">
                <span className="text-[12px] font-black text-slate-900">{currentPage}</span>
                <span className="text-[10px] font-black text-slate-200">/</span>
                <span className="text-[12px] font-black text-slate-400">{totalPages}</span>
              </div>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-14 rounded-full font-black text-[11px] uppercase tracking-widest px-10 border-slate-100 text-slate-400 hover:bg-slate-900 hover:text-white transition-none shadow-sm"
              >
                NEXT_FEED
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

    return (
      <Card
        className="p-12 border border-slate-100 bg-white rounded-3xl transition-none cursor-pointer group/card hover:bg-slate-50/50 shadow-2xl shadow-slate-900/5"
        onClick={() => handleViewDetails(order)}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-12">
          <div className="flex-1 space-y-10">
            <div className="flex items-center gap-6">
              <span className="font-black text-slate-900 tracking-tighter text-3xl uppercase leading-none">
                {order.code}
              </span>
              {(activeTab === "all" || order.status === "completed") && getStatusBadge(order.status, order.pharmacy_ack_status)}
              {late && (
                <div className="px-6 py-2.5 rounded-full bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-rose-500/30">
                    CRITICAL_DELAY
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">LOGISTICS_NODE</p>
                    <div className="flex items-center gap-4">
                        <Map className="h-5 w-5 text-slate-200" />
                        <span className="text-base font-black text-slate-900 uppercase tracking-widest leading-none">{order.delivery_area || "UNIVERSAL_SECTOR"}</span>
                    </div>
                </div>
                <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">PAYLOAD_MATRIX</p>
                    <div className="flex items-center gap-4">
                        <Package className="h-5 w-5 text-slate-200" />
                        <span className="text-base font-black text-slate-900 uppercase tracking-widest tabular-nums leading-none">{itemCount} SKUs • ₵{Number(order.total_price_ghs || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>
                <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">SYNCHRONIZED_PULSE</p>
                    <div className="flex items-center gap-4">
                        <Clock className="h-5 w-5 text-slate-200" />
                        <span className="text-base font-black text-slate-400 uppercase tracking-widest tabular-nums leading-none">
                            {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }).toUpperCase()}
                        </span>
                    </div>
                </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-5 shrink-0">
            {order.status === "received" && order.pharmacy_ack_status === "pending" ? (
              <>
                <Button
                  size="lg"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-black text-[11px] uppercase tracking-widest gap-4 rounded-full px-12 h-16 border-none shadow-2xl shadow-slate-900/20 transition-none"
                  onClick={(e) => { e.stopPropagation(); handleAccept(order.id); }}
                  disabled={acceptLoading}
                >
                  {acceptLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5 text-brand-teal" />}
                  EXECUTE_PROTOCOL
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-500 font-black text-[11px] uppercase tracking-widest gap-4 rounded-full px-12 h-16 transition-none shadow-sm"
                  onClick={(e) => { e.stopPropagation(); handleDeclineClick(order.id); }}
                  disabled={declineLoading}
                >
                  <XCircle className="h-5 w-5" />
                  DECLINE
                </Button>
              </>
            ) : order.status === "processing" ? (
              <Button
                size="lg"
                className="bg-slate-900 hover:bg-slate-800 text-white font-black text-[11px] uppercase tracking-widest gap-4 rounded-full px-16 h-16 border-none shadow-2xl shadow-slate-900/20 transition-none"
                onClick={(e) => { e.stopPropagation(); handleMarkOutForDelivery(order.id); }}
              >
                <Truck className="h-6 w-6 text-brand-teal" />
                DISPATCH_NODE
              </Button>
            ) : order.status === "out_for_delivery" ? (
              <Button
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] uppercase tracking-widest gap-4 rounded-full px-16 h-16 border-none shadow-2xl shadow-emerald-600/20 transition-none"
                onClick={(e) => { e.stopPropagation(); handleMarkCompleted(order.id); }}
              >
                <ShieldCheck className="h-6 w-6" />
                FINALIZE_DELIVERY
              </Button>
            ) : (
              <Button
                size="lg"
                variant="ghost"
                className="text-slate-200 font-black text-[11px] uppercase tracking-widest gap-4 rounded-full px-12 h-16 transition-none"
                disabled
              >
                <ShieldCheck className="h-6 w-6" />
                FINALIZED
              </Button>
            )}
            
            <div className="flex items-center gap-3">
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => handleOpenChat(e, order.id)}
                className="text-slate-300 hover:text-slate-900 h-16 w-16 rounded-full bg-slate-50/50 hover:bg-white border border-slate-100 hover:border-slate-200 transition-none shadow-sm"
              >
                <MessageSquare className="h-6 w-6" />
              </Button>

              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => { e.stopPropagation(); handleViewDetails(order); }}
                className="text-slate-300 hover:text-slate-900 h-16 w-16 rounded-full bg-slate-50/50 hover:bg-white border border-slate-100 hover:border-slate-200 transition-none shadow-sm"
              >
                <Eye className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="p-12">
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setCurrentPage(1); }} className="w-full space-y-16">
        <div className="flex items-center justify-center lg:justify-start">
          <TabsList className="bg-slate-50 p-2.5 rounded-full h-20 border border-slate-100 gap-3 shadow-sm">
            <TabsTrigger 
              value="incoming" 
              className="rounded-full px-12 h-14 font-black text-[12px] uppercase tracking-[0.2em] data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-2xl shadow-slate-900/10 text-slate-400 transition-none"
            >
              INBOUND
              {queueOrders.length > 0 && (
                <span className="ml-5 h-6 min-w-[1.5rem] px-2.5 flex items-center justify-center rounded-full bg-brand-teal text-white text-[10px] font-black shadow-2xl shadow-brand-teal/20">
                  {queueOrders.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="preparing" 
              className="rounded-full px-12 h-14 font-black text-[12px] uppercase tracking-[0.2em] data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-2xl shadow-slate-900/10 text-slate-400 transition-none"
            >
              STAGING
              {processingOrders.length > 0 && (
                <span className="ml-5 h-6 min-w-[1.5rem] px-2.5 flex items-center justify-center rounded-full bg-brand-teal text-white text-[10px] font-black shadow-2xl shadow-brand-teal/20">
                  {processingOrders.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="outbound" 
              className="rounded-full px-12 h-14 font-black text-[12px] uppercase tracking-[0.2em] data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-2xl shadow-slate-900/10 text-slate-400 transition-none"
            >
              TRANSIT
              {inTransitOrders.length > 0 && (
                <span className="ml-5 h-6 min-w-[1.5rem] px-2.5 flex items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-black shadow-2xl shadow-amber-500/20">
                  {inTransitOrders.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="completed" 
              className="rounded-full px-12 h-14 font-black text-[12px] uppercase tracking-[0.2em] data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-2xl shadow-slate-900/10 text-slate-400 transition-none"
            >
              ARCHIVE
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="incoming" className="focus-visible:outline-none outline-none">
          {renderPaginatedList(queueOrders, "No inbound node traffic detected.", Clock)}
        </TabsContent>

        <TabsContent value="preparing" className="focus-visible:outline-none outline-none">
          {renderPaginatedList(processingOrders, "Preparation bench clear. All staging nodes empty.", Package)}
        </TabsContent>

        <TabsContent value="outbound" className="focus-visible:outline-none outline-none">
          {renderPaginatedList(inTransitOrders, "No active logistics shipments detected.", Truck)}
        </TabsContent>

        <TabsContent value="completed" className="focus-visible:outline-none outline-none">
          {renderPaginatedList(completedOrders, "Archive stream empty. No historical logs.", History)}
        </TabsContent>
      </Tabs>

      <AlertDialog open={declineDialogOpen} onOpenChange={setDeclineDialogOpen}>
        <AlertDialogContent className="rounded-3xl border-none shadow-2xl p-16 bg-white transition-none max-w-2xl">
          <AlertDialogHeader className="space-y-10">
            <div className="h-20 w-20 rounded-3xl bg-rose-50 flex items-center justify-center border border-rose-100 shadow-2xl shadow-rose-500/5">
                <ShieldAlert className="h-10 w-10 text-rose-500" />
            </div>
            <div className="space-y-4">
                <AlertDialogTitle className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">Protocol Decline</AlertDialogTitle>
                <AlertDialogDescription className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] leading-none">Operational rejection of fulfillment stream.</AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <div className="py-12 space-y-8">
              <p className="text-sm font-black text-slate-600 leading-relaxed uppercase tracking-tight">
                Provide a valid operational discrepancy reason for rejecting this protocol. This action will unassign the node and log the event to root history.
              </p>
              <Textarea
                placeholder="REASON_CODE (E.G. STOCK_DEPLETION_CRITICAL)"
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                className="min-h-[180px] rounded-3xl border-slate-100 bg-slate-50/50 font-black text-sm uppercase tracking-widest px-8 py-8 leading-relaxed resize-none shadow-sm"
              />
          </div>
          <AlertDialogFooter className="gap-6 pt-12 border-t border-slate-50">
            <AlertDialogCancel
              className="rounded-full h-16 px-12 font-black text-[11px] uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-none border-none shadow-sm"
              onClick={() => {
                setDeclineReason("");
                setSelectedId(null);
              }}
            >
              ABORT_ACTION
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeclineConfirm}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-full h-16 px-16 font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-rose-600/20 transition-none border-none"
            >
              CONFIRM_DECLINE
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
          setDetailsSheetOpen(false); 
        }}
      />

      {/* Chat Dialog */}
      <Dialog open={chatDialogOpen} onOpenChange={setChatDialogOpen}>
        <DialogContent className="max-w-3xl h-[840px] border-none bg-white p-0 overflow-hidden rounded-3xl shadow-2xl transition-none">
          <div className="p-12 border-b border-slate-50 bg-slate-50/30">
            <div className="flex items-center gap-10">
                <div className="h-20 w-20 rounded-3xl bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-900/10">
                    <MessageSquare className="h-10 w-10 text-brand-teal" />
                </div>
                <div className="space-y-4">
                    <DialogTitle className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">Admin Uplink</DialogTitle>
                    <DialogDescription className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] leading-none">Secure real-time coordination with root command.</DialogDescription>
                </div>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            {activeChatOrderId && (
              <OrderMessages orderId={activeChatOrderId} userRole="pharmacy" />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
