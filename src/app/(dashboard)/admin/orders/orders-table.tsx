"use client";

import React, { useState, useEffect, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Search,
  Clock,
  Package,
  Truck,
  CheckCircle,
  CreditCard,
  AlertTriangle,
  MessageSquare,
  Check,
  ChevronsUpDown,
  Loader2,
  ChevronDown,
  ChevronRight,
  Filter,
  XCircle,
  User,
  MapPin,
  GanttChartSquare,
  History,
  Activity,
  ShieldCheck,
  ExternalLink,
  Calendar,
  Terminal,
  Zap,
  Map,
  ArrowRight,
  Info,
  Smartphone,
  Landmark,
  ShieldAlert
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { OrderMessages } from "@/components/order-messages";
import { useToast } from "@/hooks/use-toast";
import {
  assignPharmacy,
  bulkUpdateOrderStatus,
  searchPharmacies,
  flagOrderIssue,
  updateOrderStatus
} from "@/lib/admin-actions";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getSupabaseClient } from "@/lib/supabase";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { BulkActionsBar } from "@/components/dashboard/bulk-actions-bar";

export function OrdersTable({ 
  initialOrders, 
  totalOrders = 0, 
  page = 1,
  limit = 20
}: { 
  initialOrders: any[], 
  totalOrders?: number, 
  page?: number,
  limit?: number
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [orders, setOrders] = useState(initialOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkSaving, setBulkSaving] = useState(false);
  const [assigningId, setAssigningId] = useState<number | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [activeAssignOrder, setActiveAssignOrder] = useState<{
    id: number;
    pharmacyId: number | null;
  } | null>(null);

  const [riderDialogOpen, setRiderDialogOpen] = useState(false);
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState<{
    id: number;
    status: string;
    forceOverride?: boolean;
  } | null>(null);
  const [riderName, setRiderName] = useState("");
  const [riderPhone, setRiderPhone] = useState("");

  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [activeMessageOrderId, setActiveMessageOrderId] = useState<number | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = (id: number) => {
    const next = new Set(expandedRows);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedRows(next);
  };

  const [overridePrompt, setOverridePrompt] = useState<{
    orderId: number;
    newStatus: string;
    pharmacyName: string;
  } | null>(null);

  const [auditSheetOpen, setAuditSheetOpen] = useState(false);
  const [activeAuditOrder, setActiveAuditOrder] = useState<any>(null);
  const [flagDialogOpen, setFlagDialogOpen] = useState(false);
  const [activeFlagOrder, setActiveFlagOrder] = useState<any>(null);
  const [flagNote, setFlagNote] = useState("");
  const [isSubmittingFlag, setIsSubmittingFlag] = useState(false);

  const handleFlagIssue = async () => {
    if (!activeFlagOrder || !flagNote.trim()) return;
    setIsSubmittingFlag(true);
    try {
        const res = await flagOrderIssue(activeFlagOrder.id, flagNote);
        if (res.success) {
          toast({ title: "PROTOCOL_FLAG_SYNC", description: "Successfully logged the operational issue." });
          setFlagDialogOpen(false);
          setFlagNote("");
        } else {
          toast({ variant: "destructive", title: "ACTION_FAILURE", description: res.error });
        }
    } catch (e) {
        toast({ variant: "destructive", title: "TERMINAL_CRITICAL", description: "Operation failed." });
    } finally {
        setIsSubmittingFlag(false);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        o.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.email || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || o.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, filterStatus]);

  useEffect(() => {
    const supabase = getSupabaseClient();
    const channel = supabase
      .channel("admin-orders-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload: any) => {
          if (payload.eventType === "UPDATE") {
            const updatedOrder = payload.new;
            setOrders((prev) =>
              prev.map((o) => {
                if (o.id === updatedOrder.id) {
                  return {
                    ...o,
                    ...updatedOrder,
                    pharmacies: o.pharmacies,
                    order_events: o.order_events,
                  };
                }
                return o;
              }),
            );
          }
          else if (payload.eventType === "INSERT") {
            const newOrder = {
              ...payload.new,
              pharmacies: null,
              order_events: [],
            };
            setOrders((prev) => [newOrder, ...prev]);
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "order_events" },
        (payload: any) => {
          const newEvent = payload.new;
          setOrders((prev) =>
            prev.map((o) => {
              if (o.id === newEvent.order_id) {
                const events = o.order_events || [];
                if (events.some((e: any) => e.id === newEvent.id)) return o;
                return { ...o, order_events: [newEvent, ...events] };
              }
              return o;
            }),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  const handleStatusChangeClick = (orderId: number, newStatus: string) => {
    const currentOrder = orders.find((o) => o.id === orderId);
    const isRestrictedTransition =
      !!currentOrder?.pharmacy_id &&
      ["processing", "out_for_delivery", "completed"].includes(newStatus);

    if (isRestrictedTransition) {
      setOverridePrompt({
        orderId,
        newStatus,
        pharmacyName: currentOrder?.pharmacies?.name || "Assigned Node",
      });
      return;
    }

    if (newStatus === "out_for_delivery") {
      setRiderName(currentOrder?.courier_name || "");
      setRiderPhone(currentOrder?.courier_phone || "");
      setPendingStatusUpdate({ id: orderId, status: newStatus });
      setRiderDialogOpen(true);
    } else {
      executeStatusChange(orderId, newStatus);
    }
  };

  const confirmOverride = () => {
    if (overridePrompt) {
      if (overridePrompt.newStatus === "out_for_delivery") {
        const currentOrder = orders.find(
          (o) => o.id === overridePrompt.orderId,
        );
        setRiderName(currentOrder?.courier_name || "");
        setRiderPhone(currentOrder?.courier_phone || "");
        setPendingStatusUpdate({
          id: overridePrompt.orderId,
          status: overridePrompt.newStatus,
          forceOverride: true,
        });
        setRiderDialogOpen(true);
      } else {
        executeStatusChange(
          overridePrompt.orderId,
          overridePrompt.newStatus,
          undefined,
          true,
        );
      }
      setOverridePrompt(null);
    }
  };

  const handleManualRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const confirmRiderAssignment = () => {
    if (pendingStatusUpdate) {
      executeStatusChange(
        pendingStatusUpdate.id,
        pendingStatusUpdate.status,
        {
          name: riderName,
          phone: riderPhone,
        },
        pendingStatusUpdate.forceOverride,
      );
      setRiderDialogOpen(false);
      setPendingStatusUpdate(null);
    }
  };

  const executeStatusChange = async (
    orderId: number,
    newStatus: string,
    courierDetails?: { name: string; phone: string },
    forceOverride: boolean = false,
  ) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
               ...o,
               status: newStatus,
               courier_name: courierDetails?.name ?? o.courier_name,
               courier_phone: courierDetails?.phone ?? o.courier_phone,
            }
          : o,
      ),
    );

    const res = await updateOrderStatus(
      orderId,
      newStatus,
      courierDetails,
      forceOverride,
    );

    if (res.error) {
      toast({
        variant: "destructive",
        title: "SYNC_ERROR",
        description: res.error,
      });
      startTransition(() => {
        router.refresh();
      });
    } else {
      toast({
        title: "REGISTRY_SYNCHRONIZED",
        description: `Operational status synchronized to ${newStatus.toUpperCase()}`,
      });
      startTransition(() => {
        router.refresh();
      });
    }
  };

  const executeBulkStatusChange = async (
    status: string,
    forceOverride: boolean = false,
  ) => {
    setBulkSaving(true);
    const res = await bulkUpdateOrderStatus(
      Array.from(selectedIds),
      status,
      forceOverride,
    );
    if (res.error) {
      toast({
        variant: "destructive",
        title: "BATCH_SYNC_FAILURE",
        description: res.error,
      });
    } else {
      toast({
        title: "BATCH_ACTION_COMPLETE",
        description: res.warning
          ? res.warning
          : `Streams synchronized to ${status.toUpperCase()}`,
      });
      setOrders((prev) =>
        prev.map((o) => (selectedIds.has(o.id) ? { ...o, status } : o)),
      );
      setSelectedIds(new Set());
      startTransition(() => {
        router.refresh();
      });
    }
    setBulkSaving(false);
  };

  const handleAssignPharmacy = async (
    orderId: number,
    pharmacyId: number,
    pharmacyName: string,
  ) => {
    setAssigningId(orderId);
    try {
      const res = await assignPharmacy(orderId, pharmacyId);
      if (res.success) {
        toast({
          title: "NODE_ROUTED",
          description: `Order successfully routed to terminal ${pharmacyName}`,
        });
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  pharmacy_id: pharmacyId,
                  pharmacies: { name: pharmacyName },
                  status:
                    o.status === "pending_payment" ? "received" : o.status,
                }
              : o,
          ),
        );
        startTransition(() => {
          router.refresh();
        });
      } else {
        toast({
          variant: "destructive",
          title: "ROUTING_FAILURE",
          description: res.error,
        });
      }
    } catch (e) {
      toast({
        variant: "destructive",
        title: "TERMINAL_CRITICAL",
        description: "Failed to assign operational node.",
      });
    } finally {
      setAssigningId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const base = status.toUpperCase().replace(/_/g, " ");
    switch (status) {
      case "completed":
        return (
          <div className="flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-sm transition-none">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">{base}</span>
          </div>
        );
      case "processing":
        return (
          <div className="flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-slate-900 text-white border-none shadow-2xl shadow-slate-900/20 transition-none">
            <Activity className="h-4 w-4 text-brand-teal" />
            <span className="text-[10px] font-black uppercase tracking-widest">{base}</span>
          </div>
        );
      case "out_for_delivery":
        return (
          <div className="flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 shadow-sm transition-none">
            <Truck className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">{base}</span>
          </div>
        );
      case "pending_payment":
        return (
          <div className="flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-sm transition-none">
            <CreditCard className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">{base}</span>
          </div>
        );
      case "received":
        return (
          <div className="flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-brand-teal/10 text-brand-teal border border-brand-teal/20 shadow-sm transition-none">
            <Clock className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">{base}</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-slate-50 text-slate-300 border border-slate-100 transition-none">
             <span className="text-[10px] font-black uppercase tracking-widest">{base}</span>
          </div>
        );
    }
  };

  const totalPages = Math.ceil(totalOrders / limit);
  const handlePageChange = (p: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", p.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="space-y-16">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-12">
        <div className="relative flex-1 w-full max-w-3xl group">
          <Search className="absolute left-10 top-1/2 -translate-y-1/2 h-7 w-7 text-slate-300 group-focus-within:text-brand-teal transition-none" />
          <Input
            type="search"
            placeholder="PROTOCOL_SEARCH: FILTER_ORDER_MATRIX..."
            className="pl-24 h-20 rounded-[32px] font-black text-[12px] uppercase tracking-[0.25em] border-none bg-slate-50/50 placeholder:text-slate-200 focus-visible:ring-0 focus-visible:bg-white focus-visible:shadow-2xl shadow-slate-900/5 transition-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-4 bg-slate-50/50 p-3 rounded-[32px] border border-slate-50">
          {[
            "all",
            "pending_payment",
            "received",
            "processing",
            "out_for_delivery",
            "completed",
          ].map((s) => (
            <button
              key={s}
              className={cn(
                "h-16 px-12 rounded-full font-black text-[11px] uppercase tracking-widest transition-none whitespace-nowrap",
                filterStatus === s 
                  ? "bg-slate-900 text-white shadow-2xl shadow-slate-900/10" 
                  : "text-slate-400 hover:text-slate-900 hover:bg-white"
              )}
              onClick={() => setFilterStatus(s)}
            >
              {s === "all" ? "MASTER_MATRIX" : s.toUpperCase().replace(/_/g, " ")}
            </button>
          ))}
          <div className="h-10 w-px bg-slate-200 mx-4" />
          <Button variant="ghost" size="icon" className="h-16 w-16 rounded-full text-slate-300 hover:text-slate-900 hover:bg-white transition-none border-none shadow-sm" onClick={handleManualRefresh} disabled={isPending}>
             {isPending ? <Loader2 className="h-7 w-7 animate-spin text-brand-teal" /> : <History className="h-7 w-7" />}
          </Button>
        </div>
      </div>

      <div className="overflow-hidden transition-none">
        <Table className="min-w-[1500px]">
          <TableHeader className="bg-slate-50/30 border-b border-slate-50">
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="w-[120px] pl-16 py-12">
                <Checkbox
                  checked={filteredOrders.length > 0 && filteredOrders.every((o) => selectedIds.has(o.id))}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedIds(new Set(filteredOrders.map((o) => o.id)));
                    } else {
                      setSelectedIds(new Set());
                    }
                  }}
                  className="h-7 w-7 rounded-lg border-slate-200 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900 transition-none"
                />
              </TableHead>
              <TableHead className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 py-12">IDENTITY_PULSE</TableHead>
              <TableHead className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 py-12">TIMELINE_SYNC</TableHead>
              <TableHead className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 py-12">PROTOCOL_PAYLOAD</TableHead>
              <TableHead className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 py-12 text-center">OPERATIONAL_STATUS</TableHead>
              <TableHead className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 py-12">ACTIVE_NODE</TableHead>
              <TableHead className="text-right text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 py-12 pr-16">FISCAL_YIELD</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TooltipProvider>
              {filteredOrders.map((order) => {
                const isExpanded = expandedRows.has(order.id);
                const isDelayedUnassigned = !order.pharmacy_id && (new Date().getTime() - new Date(order.created_at).getTime()) > 15 * 60 * 1000;
                
                return (
                  <React.Fragment key={order.id}>
                    <TableRow
                      className={cn(
                        "border-slate-50 group transition-none cursor-pointer",
                        selectedIds.has(order.id) ? "bg-slate-50/50" : "hover:bg-slate-50/30",
                        isExpanded && "bg-slate-50/30 border-b-0"
                      )}
                      onClick={() => toggleRow(order.id)}
                    >
                      <TableCell className="pl-16 py-12" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-10">
                           <button className="text-slate-200 group-hover:text-slate-900 transition-none outline-none">
                             {isExpanded ? <ChevronDown className="h-7 w-7" /> : <ChevronRight className="h-7 w-7" />}
                           </button>
                           <Checkbox
                             checked={selectedIds.has(order.id)}
                             onCheckedChange={(checked) => {
                               setSelectedIds((prev) => {
                                 const next = new Set(prev);
                                 if (checked) next.add(order.id);
                                 else next.delete(order.id);
                                 return next;
                               });
                             }}
                             className="h-7 w-7 rounded-lg border-slate-200 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900 transition-none"
                           />
                        </div>
                      </TableCell>
                      <TableCell className="py-12">
                        <div className="flex flex-col gap-3">
                            <span className="font-black text-slate-900 uppercase tracking-widest text-sm leading-none">{order.code}</span>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">STRM_#{order.id}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-12">
                        <div className="flex flex-col gap-3">
                            <span className="text-sm font-black text-slate-900 uppercase tracking-widest tabular-nums leading-none">
                               {new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase()}
                            </span>
                            <div className="flex items-center gap-3 text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">
                                <Clock className="h-4 w-4 text-slate-200" />
                                {new Date(order.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' }).toUpperCase()}
                            </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-12" onClick={(e) => e.stopPropagation()}>
                        {order.delivery_address_note ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-4 px-6 py-3 rounded-full bg-slate-50 border border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-widest cursor-help hover:text-slate-900 hover:border-slate-200 hover:shadow-2xl hover:shadow-slate-900/5 transition-none shadow-sm">
                                <Zap className="h-4 w-4 text-brand-teal" />
                                VIEW_PAYLOAD
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[440px] p-12 rounded-[32px] border-none shadow-2xl bg-slate-900 text-white backdrop-blur-xl">
                                <div className="space-y-8">
                                    <div className="flex items-center gap-4">
                                        <Terminal className="h-5 w-5 text-brand-teal" />
                                        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">Internal Telemetry Payload</p>
                                    </div>
                                    <p className="text-base font-black leading-relaxed uppercase tracking-tight italic text-slate-200">&quot;{order.delivery_address_note.toUpperCase()}&quot;</p>
                                </div>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <div className="flex items-center gap-4 text-[11px] font-black text-slate-100 uppercase tracking-widest leading-none">
                             <div className="h-2 w-8 bg-slate-50 rounded-full" />
                             NOMINAL
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="py-12" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-6">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="outline-none transition-none">
                                {getStatusBadge(order.status)}
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="center" className="w-[360px] rounded-[40px] border-none shadow-2xl p-6 bg-white transition-none">
                              <div className="flex items-center gap-4 px-8 py-6 border-b border-slate-50 mb-4">
                                  <Activity className="h-5 w-5 text-brand-teal" />
                                  <DropdownMenuLabel className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 p-0">Terminal_Control</DropdownMenuLabel>
                              </div>
                              <div className="py-2 space-y-2">
                                  <DropdownMenuItem
                                    onSelect={(e) => {
                                      e.preventDefault();
                                      setActiveMessageOrderId(order.id);
                                      setMessageDialogOpen(true);
                                    }}
                                    className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-600 px-8 py-6 rounded-[32px] transition-none cursor-pointer focus:bg-slate-50 focus:text-slate-900 flex items-center gap-6"
                                  >
                                    <MessageSquare className="h-6 w-6 text-slate-300" />
                                    <span>OPERATIONAL_CHAT</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-slate-50 mx-6" />
                                  {[
                                    "pending_payment",
                                    "received",
                                    "processing",
                                    "out_for_delivery",
                                    "completed",
                                  ].map((s) => (
                                    <DropdownMenuItem
                                      key={s}
                                      onClick={() => handleStatusChangeClick(order.id, s)}
                                      className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-600 px-8 py-5 rounded-2xl transition-none cursor-pointer focus:bg-slate-50 focus:text-slate-900"
                                    >
                                      {s.toUpperCase().replace(/_/g, " ")}
                                    </DropdownMenuItem>
                                  ))}
                                  <DropdownMenuSeparator className="bg-slate-50 mx-6" />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setActiveAssignOrder({
                                        id: order.id,
                                        pharmacyId: order.pharmacy_id,
                                      });
                                      setAssignDialogOpen(true);
                                    }}
                                    className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-600 px-8 py-6 rounded-[32px] transition-none cursor-pointer focus:bg-slate-50 focus:text-slate-900 flex items-center gap-6"
                                  >
                                    <ShieldCheck className="h-6 w-6 text-slate-300" />
                                    ASSIGN_MASTER_NODE
                                  </DropdownMenuItem>
                              </div>
                            </DropdownMenuContent>
                          </DropdownMenu>

                          {order.status === "out_for_delivery" && order.courier_name && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className="h-14 px-8 rounded-full bg-slate-50 border border-slate-100 text-slate-600 text-[11px] font-black uppercase tracking-widest flex items-center gap-4 cursor-help hover:text-slate-900 hover:border-slate-200 hover:shadow-2xl hover:shadow-slate-900/5 transition-none shadow-sm"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Truck className="h-5 w-5 text-brand-teal" />
                                  {order.courier_name.toUpperCase()}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="bg-slate-900 text-white border-none p-16 rounded-[40px] shadow-2xl w-[480px] backdrop-blur-xl" side="top">
                                <div className="space-y-16">
                                  <div className="flex items-center gap-10">
                                    <div className="w-24 h-24 rounded-[32px] bg-white/5 flex items-center justify-center border border-white/10 shadow-2xl shadow-black/20">
                                      <Activity className="h-12 w-12 text-brand-teal" />
                                    </div>
                                    <div className="space-y-4">
                                      <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500 leading-none">Active Logistics Node</p>
                                      <p className="text-3xl font-black uppercase tracking-tighter leading-none">{order.courier_name.toUpperCase()}</p>
                                    </div>
                                  </div>
                                  <div className="pt-12 border-t border-white/5 space-y-12">
                                    <div className="space-y-4">
                                        <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500 leading-none">Secure Comms Channel</p>
                                        <p className="text-4xl font-black tabular-nums tracking-tighter leading-none">{order.courier_phone}</p>
                                    </div>
                                    <Button asChild className="w-full h-20 bg-brand-teal hover:bg-brand-teal/90 text-white rounded-full font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-brand-teal/30 transition-none border-none gap-6">
                                        <a href={`tel:${order.courier_phone}`}>
                                            INITIATE_GLOBAL_UPLINK
                                            <ArrowRight className="h-6 w-6" />
                                        </a>
                                    </Button>
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-12" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-6">
                          <PharmacyCombobox
                            orderId={order.id}
                            currentPharmacyId={order.pharmacy_id}
                            currentPharmacyName={order.pharmacies?.name}
                            deliveryArea={order.delivery_area}
                            onAssign={handleAssignPharmacy}
                            loading={assigningId === order.id}
                            isUrgent={isDelayedUnassigned}
                          />
                          {order.pharmacy_ack_status === "declined" && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="h-12 w-12 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20 shadow-2xl shadow-rose-500/10 animate-pulse">
                                    <AlertTriangle className="h-6 w-6 text-rose-500" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="bg-rose-600 text-white border-none rounded-[32px] p-8 text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl max-w-[320px]">
                                PROTOCOL_VIOLATION: NODE_REJECTION_DETECTED_IN_MATRIX
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right py-12 pr-16">
                        <div className="flex flex-col items-end gap-3">
                            <span className="text-lg font-black text-slate-900 uppercase tracking-widest tabular-nums leading-none">₵{Number(order.total_price_ghs || order.total_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            <div className="flex items-center gap-3">
                                <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]" />
                                <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest leading-none">SETTLED_SYNC</span>
                            </div>
                        </div>
                      </TableCell>
                    </TableRow>
                    
                    {/* Expanded Detail View */}
                    {isExpanded && (
                        <TableRow className="bg-slate-50/20 border-none hover:bg-slate-50/20 transition-none">
                          <TableCell colSpan={8} className="p-0">
                              <div className="mx-16 mb-16 mt-6 p-16 grid grid-cols-1 xl:grid-cols-3 gap-24 bg-white rounded-[48px] shadow-2xl shadow-slate-900/10 border border-slate-50 relative overflow-hidden transition-none group/detail">
                                <div className="absolute top-0 left-0 w-3 h-full bg-slate-900" />
                                
                                <div className="space-y-20">
                                  <div className="space-y-10">
                                    <div className="flex items-center gap-6">
                                      <User className="h-8 w-8 text-slate-300" />
                                      <h4 className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-400 leading-none">ENTITY_IDENTITY_MANIFEST</h4>
                                    </div>
                                    <div className="pl-14 border-l-8 border-slate-50 space-y-8 py-2">
                                      <p className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">{order.email?.toUpperCase() || "MASTER_ROOT_IDENTITY"}</p>
                                      <div className="flex items-center gap-14">
                                        <div className="space-y-3">
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] leading-none">STREAM_SYNC_ID</p>
                                            <p className="text-[12px] font-black text-slate-900 uppercase tracking-widest tabular-nums leading-none">#{order.id}</p>
                                        </div>
                                        <div className="space-y-3">
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] leading-none">IDENTITY_TERMINAL</p>
                                            <p className="text-[12px] font-black text-slate-900 uppercase tracking-widest leading-none tabular-nums">{order.phone_masked || "NON_PII_LOG_SECURE"}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-10">
                                    <div className="flex items-center gap-6">
                                      <MapPin className="h-8 w-8 text-slate-300" />
                                      <h4 className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-400 leading-none">LOGISTICS_VECTOR_COORDS</h4>
                                    </div>
                                    <div className="pl-14 border-l-8 border-slate-50 space-y-10 py-2">
                                      <p className="text-xl font-black text-slate-900 uppercase tracking-widest leading-none">{order.delivery_area?.toUpperCase() || "UNIVERSAL_SECTOR_GRID"}</p>
                                      <div className="p-12 bg-slate-50/50 rounded-[32px] border border-slate-50 space-y-8 shadow-sm">
                                        <div className="flex items-center gap-5">
                                            <MessageSquare className="h-5 w-5 text-brand-teal" />
                                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none italic">Node_Payload_Protocol_Note</p>
                                        </div>
                                        <p className="text-base font-black text-slate-600 leading-relaxed uppercase tracking-tight italic border-l-4 border-slate-200 pl-8">
                                          &quot;{order.delivery_address_note?.toUpperCase() || "OPERATIONAL TELEMETRY NOMINAL. NO MANUAL PAYLOAD PROVIDED BY IDENTITY."}&quot;
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-20">
                                  <div className="space-y-10">
                                    <div className="flex items-center gap-6">
                                      <Package className="h-8 w-8 text-slate-300" />
                                      <h4 className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-400 leading-none">SKU_REGISTRY_MATRIX_FEED</h4>
                                    </div>
                                  <div className="pl-14 border-l-8 border-slate-50 space-y-8 py-2">
                                    {(() => {
                                      const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
                                      const itemsArray = Array.isArray(items) ? items : [];
                                      return (
                                        <div className="space-y-5">
                                          {itemsArray.slice(0, 8).map((item: any, i: number) => (
                                            <div key={i} className="flex justify-between items-center p-8 rounded-[32px] bg-slate-50/30 border border-transparent hover:border-slate-50 hover:bg-white hover:shadow-2xl hover:shadow-slate-900/5 transition-none group/item shadow-sm">
                                              <div className="flex items-center gap-6">
                                                  <div className="h-12 w-12 rounded-full bg-white border border-slate-100 flex items-center justify-center text-[11px] font-black text-slate-300 group-hover/item:border-brand-teal transition-none shadow-sm">{i+1 < 10 ? `0${i+1}` : i+1}</div>
                                                  <span className="text-[14px] font-black text-slate-700 uppercase tracking-tight truncate max-w-[280px] leading-none">{item.name.toUpperCase()}</span>
                                              </div>
                                              <span className="text-lg font-black text-slate-900 tabular-nums uppercase leading-none">×{item.quantity}</span>
                                            </div>
                                          ))}
                                          {itemsArray.length > 8 && (
                                            <div className="flex items-center gap-5 px-8 pt-6">
                                                <div className="h-2 w-12 bg-brand-teal rounded-full shadow-[0_0_12px_rgba(20,184,166,0.5)]" />
                                                <p className="text-[12px] font-black text-brand-teal uppercase tracking-[0.3em] leading-none">+{itemsArray.length - 8} EXTENDED_SKU_STREAMS_MAPPED</p>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })()}
                                  </div>
                                </div>
                                
                                <div className="space-y-10">
                                  <div className="flex items-center gap-6">
                                    <CreditCard className="h-8 w-8 text-slate-300" />
                                    <h4 className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-400 leading-none">FISCAL_TELEMETRY_SYNC_PROTOCOL</h4>
                                  </div>
                                  <div className="pl-14 border-l-8 border-slate-50 space-y-6 py-2">
                                    <p className="text-5xl font-black text-slate-900 tracking-tighter tabular-nums leading-none uppercase">₵{Number(order.total_price_ghs || order.total_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                    <div className="flex items-center gap-5 pt-4">
                                        <div className="h-3.5 w-3.5 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.7)]" />
                                        <p className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.3em] leading-none">Settlement Confirmed: Global Provisioning Synchronized</p>
                                    </div>
                                  </div>
                                </div>
                                </div>

                                <div className="space-y-20 bg-slate-900 rounded-[48px] p-16 flex flex-col justify-between shadow-2xl shadow-slate-900/30 relative">
                                  <div className="absolute top-10 right-10 opacity-10">
                                      <ShieldAlert className="h-16 w-16 text-white" />
                                  </div>
                                  <div className="space-y-16">
                                    <div className="flex items-center gap-6">
                                      <Terminal className="h-10 w-10 text-brand-teal" />
                                      <h4 className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-500 leading-none">NODE_COMMAND_TERMINAL_UPLINK</h4>
                                    </div>
                                    <div className="space-y-10">
                                      <div className="flex items-center justify-between p-10 bg-white/5 rounded-[40px] border border-white/5 transition-none shadow-2xl">
                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 leading-none">OPERATIONAL_NODE_IDENTITY</p>
                                            <p className="text-xl font-black text-white uppercase tracking-widest leading-none">{order.pharmacies?.name?.toUpperCase() || "UNASSIGNED_PROTOCOL_STATION"}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-16 w-16 rounded-[24px] bg-white/10 text-brand-teal hover:bg-brand-teal hover:text-white transition-none border-none shadow-2xl" onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveMessageOrderId(order.id);
                                          setMessageDialogOpen(true);
                                        }}>
                                          <MessageSquare className="h-8 w-8" />
                                        </Button>
                                      </div>
                                      <div className="grid grid-cols-1 gap-8">
                                        <Button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveAuditOrder(order);
                                            setAuditSheetOpen(true);
                                          }}
                                          className="h-20 bg-white text-slate-900 hover:bg-slate-100 rounded-full font-black text-[12px] uppercase tracking-[0.25em] shadow-2xl shadow-black/30 transition-none border-none gap-6"
                                        >
                                          <History className="h-6 w-6" />
                                          EXECUTE_EXHAUSTIVE_AUDIT_PROTOCOL
                                        </Button>
                                        <Button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveFlagOrder(order);
                                            setFlagDialogOpen(true);
                                          }}
                                          variant="outline" 
                                          className="h-20 border-white/10 bg-white/5 hover:bg-rose-500/10 rounded-full font-black text-[12px] uppercase tracking-[0.25em] text-rose-500 hover:text-rose-400 transition-none border-none gap-6"
                                        >
                                          <AlertTriangle className="h-6 w-6" />
                                          FLAG_PROTOCOL_VIOLATION_SIGNAL
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="pt-12 border-t border-white/5">
                                    <Button asChild variant="link" className="px-0 h-auto text-brand-teal text-[13px] font-black uppercase tracking-[0.3em] hover:no-underline group/link transition-none border-none">
                                      <Link href={`/admin/orders/${order.id}`} className="flex items-center gap-6">
                                        MASTER_NODE_DETAILED_VIEW
                                        <ArrowRight className="h-6 w-6 group-hover/link:translate-x-3 transition-transform duration-300" />
                                      </Link>
                                    </Button>
                                  </div>
                                </div>
                              </div>
                          </TableCell>
                        </TableRow>
                      )}
                  </React.Fragment>
                );
              })}
            </TooltipProvider>
            {filteredOrders.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-80 text-center bg-slate-50/20 border-none transition-none">
                  <div className="flex flex-col items-center gap-12">
                      <div className="h-40 w-40 rounded-[48px] bg-white border border-slate-50 flex items-center justify-center shadow-2xl shadow-slate-900/10">
                        <XCircle className="h-20 w-20 text-slate-100" />
                      </div>
                      <div className="space-y-6">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.4em] leading-none">MATRIX_SCAN_NOMINAL_STATE</h3>
                        <p className="text-[11px] font-black text-slate-200 uppercase tracking-[0.3em] max-w-lg mx-auto leading-relaxed">No operational streams match the current protocol parameters. Re-initialize terminal filters to refresh global registry feed matrix.</p>
                      </div>
                      <Button 
                        variant="outline" 
                        className="rounded-full h-20 px-20 font-black text-[12px] uppercase tracking-[0.25em] border-slate-100 text-slate-400 hover:bg-slate-900 hover:text-white transition-none gap-6 shadow-2xl shadow-slate-900/5"
                        onClick={() => {
                          setSearchTerm("");
                          setFilterStatus("all");
                        }}
                      >
                        <Filter className="h-6 w-6" /> RESET_OPERATIONAL_PROTOCOL_STATION
                      </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-12 pt-16 border-t border-slate-50 px-8">
          <div className="flex items-center gap-6">
              <div className="h-3 w-3 rounded-full bg-brand-teal shadow-[0_0_15px_rgba(20,184,166,0.7)]" />
              <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.3em]">
                  MATRIX_INDEX: <span className="text-slate-900">{(page - 1) * limit + 1}-{Math.min(page * limit, totalOrders)}</span> / {totalOrders} ACTIVE_STREAMS_SYNC
              </p>
          </div>
          <div className="flex items-center gap-10">
              <Button 
                  variant="outline" 
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="h-16 px-12 rounded-full font-black text-[11px] uppercase tracking-widest border-slate-50 text-slate-300 hover:bg-slate-900 hover:text-white transition-none shadow-sm"
              >
                  PREVIOUS_FRAME_LOG
              </Button>
              <div className="flex items-center gap-4 p-2.5 bg-slate-50/50 rounded-[24px] border border-slate-50">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                          <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={cn(
                                  "h-12 w-12 rounded-2xl text-[12px] font-black uppercase tracking-widest transition-none shadow-sm",
                                  page === pageNum 
                                      ? "bg-slate-900 text-white shadow-2xl shadow-slate-900/30" 
                                      : "text-slate-300 hover:text-slate-900 hover:bg-white"
                              )}
                          >
                              {pageNum}
                          </button>
                      );
                  })}
              </div>
              <Button 
                  variant="outline" 
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages || totalPages === 0}
                  className="h-16 px-12 rounded-full font-black text-[11px] uppercase tracking-widest border-slate-50 text-slate-300 hover:bg-slate-900 hover:text-white transition-none shadow-sm"
              >
                  NEXT_FRAME_LOG
              </Button>
          </div>
      </div>

      <BulkActionsBar 
        selectedCount={selectedIds.size}
        onClear={() => setSelectedIds(new Set())}
        actions={[
            { 
                label: "BATCH_SYNC_STATUS", 
                onClick: () => {
                    const s = "completed"; // Default or trigger menu
                    executeBulkStatusChange(s);
                }, 
                icon: <Activity className="h-6 w-6" />, 
                variant: "default" 
            }
        ]}
      />

      {/* Override Dialog */}
      <Dialog
        open={!!overridePrompt}
        onOpenChange={(open) => !open && setOverridePrompt(null)}
      >
        <DialogContent className="max-w-[640px] rounded-[48px] border-none shadow-2xl p-16 bg-white transition-none overflow-hidden">
          <div className="absolute top-0 right-0 p-16 opacity-5">
              <ShieldAlert className="h-40 w-40" />
          </div>
          <DialogHeader className="space-y-10 relative">
            <div className="h-24 w-24 rounded-[32px] bg-rose-500/10 flex items-center justify-center border border-rose-500/20 shadow-2xl shadow-rose-500/10">
                <AlertTriangle className="h-12 w-12 text-rose-500" />
            </div>
            <div className="space-y-4">
                <DialogTitle className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">Protocol Intervention</DialogTitle>
                <div className="flex items-center gap-6">
                    <div className="h-2 w-12 bg-rose-500 rounded-full shadow-[0_0_12px_rgba(244,63,94,0.5)]" />
                    <DialogDescription className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em] leading-none">Manual operational workflow override requested.</DialogDescription>
                </div>
            </div>
          </DialogHeader>
          <div className="py-16 space-y-12 relative">
              <p className="text-base font-black text-slate-600 leading-relaxed uppercase tracking-tight">
                This stream is actively controlled by <span className="text-slate-900 font-black underline decoration-slate-200 underline-offset-8">{overridePrompt?.pharmacyName.toUpperCase()}</span>. 
                Forced intervention will synchronize global registry to <span className="text-brand-teal font-black">{overridePrompt ? overridePrompt.newStatus.toUpperCase().replace(/_/g, " ") : ""}</span>.
              </p>
              <div className="p-12 bg-rose-500/5 rounded-[32px] border border-rose-500/10 space-y-6 shadow-sm">
                  <div className="flex items-center gap-5">
                      <ShieldAlert className="h-6 w-6 text-rose-500" />
                      <p className="text-[11px] font-black text-rose-600 uppercase tracking-[0.3em] leading-none">Critical_Warning_Protocol</p>
                  </div>
                  <p className="text-[12px] font-black text-rose-500 uppercase tracking-tight leading-relaxed italic border-l-4 border-rose-200 pl-8">
                    Manual overrides may disrupt partner synchronization logs and fiscal reconciliation streams. Proceed only for emergency protocol corrections.
                  </p>
              </div>
          </div>
          <DialogFooter className="gap-8 pt-16 border-t border-slate-50 relative">
            <Button variant="ghost" onClick={() => setOverridePrompt(null)} className="rounded-full h-20 px-16 font-black text-[12px] uppercase tracking-widest text-slate-300 hover:bg-slate-50 transition-none border-none">Abort_Protocol_Station</Button>
            <Button variant="destructive" onClick={confirmOverride} className="rounded-full h-20 px-20 bg-rose-600 hover:bg-rose-700 text-white font-black text-[12px] uppercase tracking-widest shadow-2xl shadow-rose-600/30 transition-none border-none gap-6">
                EXECUTE_INTERVENTION_SIGNAL
                <ArrowRight className="h-6 w-6" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rider Dialog */}
      <Dialog open={riderDialogOpen} onOpenChange={setRiderDialogOpen}>
        <DialogContent className="max-w-[640px] rounded-[48px] border-none shadow-2xl p-16 bg-white transition-none overflow-hidden">
          <div className="absolute top-0 right-0 p-16 opacity-5">
              <Truck className="h-40 w-40" />
          </div>
          <DialogHeader className="space-y-10 relative">
            <div className="h-24 w-24 rounded-[32px] bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-900/30">
                <Truck className="h-12 w-12 text-brand-teal" />
            </div>
            <div className="space-y-4">
                <DialogTitle className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">Provision Dispatch Node</DialogTitle>
                <div className="flex items-center gap-6">
                    <div className="h-2 w-12 bg-brand-teal rounded-full shadow-[0_0_12px_rgba(20,184,166,0.5)]" />
                    <DialogDescription className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em] leading-none">Assign logistics terminal for active fulfillment cycle.</DialogDescription>
                </div>
            </div>
          </DialogHeader>
          <div className="py-16 space-y-12 relative">
            <div className="grid gap-6">
              <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-300 pl-8">Rider Designation Identity</Label>
              <Input
                value={riderName}
                onChange={(e) => setRiderName(e.target.value)}
                placeholder="ENTER_OPERATIONAL_DESIGNATION..."
                className="h-20 rounded-[32px] border-none bg-slate-50/50 font-black text-sm uppercase tracking-[0.2em] px-10 focus-visible:ring-0 focus-visible:bg-white focus-visible:shadow-2xl shadow-slate-900/5 transition-none"
              />
            </div>
            <div className="grid gap-6">
              <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-300 pl-8">Secure Comms Protocol</Label>
              <Input
                value={riderPhone}
                onChange={(e) => setRiderPhone(e.target.value)}
                placeholder="+233 00 000 0000"
                className="h-20 rounded-[32px] border-none bg-slate-50/50 font-black text-sm uppercase tracking-[0.2em] px-10 focus-visible:ring-0 focus-visible:bg-white focus-visible:shadow-2xl shadow-slate-900/5 transition-none tabular-nums"
              />
            </div>
          </div>
          <DialogFooter className="gap-8 pt-16 border-t border-slate-50 relative">
            <Button variant="ghost" onClick={() => setRiderDialogOpen(false)} className="rounded-full h-20 px-16 font-black text-[12px] uppercase tracking-widest text-slate-300 hover:bg-slate-50 transition-none border-none">Abort_Provisioning_Link</Button>
            <Button
              onClick={confirmRiderAssignment}
              disabled={!riderName || !riderPhone}
              className="rounded-full h-20 px-20 bg-slate-900 hover:bg-slate-800 text-white font-black text-[12px] uppercase tracking-widest shadow-2xl shadow-slate-900/30 transition-none border-none gap-6"
            >
              CONFIRM_DISPATCH_NODE_SIGNAL
              <ArrowRight className="h-6 w-6 text-brand-teal" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Message Dialog */}
      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent className="max-w-[1000px] h-[920px] rounded-[48px] border-none shadow-2xl p-0 overflow-hidden flex flex-col bg-white transition-none">
          <div className="p-16 border-b border-slate-50 bg-slate-50/30 backdrop-blur-2xl">
             <div className="flex items-center gap-10">
                <div className="h-20 w-20 rounded-[32px] bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-900/30">
                    <MessageSquare className="h-10 w-10 text-brand-teal" />
                </div>
                <div className="space-y-4">
                    <DialogTitle className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">Node Communication Hub</DialogTitle>
                    <div className="flex items-center gap-6">
                        <div className="h-2 w-12 bg-brand-teal rounded-full shadow-[0_0_12px_rgba(20,184,166,0.5)]" />
                        <DialogDescription className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em] leading-none">Secure operational uplink with fulfillment partner terminal station.</DialogDescription>
                    </div>
                </div>
             </div>
          </div>
          <div className="flex-1 overflow-hidden bg-slate-50/10">
            {activeMessageOrderId && (
              <OrderMessages orderId={activeMessageOrderId} userRole="admin" />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Audit Trail Sheet */}
      <Sheet open={auditSheetOpen} onOpenChange={setAuditSheetOpen}>
        <SheetContent className="w-[800px] sm:w-[1000px] border-none shadow-2xl p-0 overflow-y-auto bg-white transition-none scrollbar-hide">
          <div className="sticky top-0 z-30 p-16 border-b border-slate-50 bg-white/95 backdrop-blur-3xl">
            <div className="flex items-center gap-10">
                <div className="h-24 w-24 rounded-[40px] bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-900/40">
                    <History className="h-12 w-12 text-brand-teal" />
                </div>
                <div className="space-y-4">
                    <SheetTitle className="text-5xl font-black text-slate-900 uppercase tracking-tighter leading-none">Audit Stream Pulse</SheetTitle>
                    <div className="flex items-center gap-6">
                        <div className="h-2 w-14 bg-brand-teal rounded-full shadow-[0_0_15px_rgba(20,184,166,0.6)]" />
                        <SheetDescription className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em] leading-none">Complete operational telemetry matrix for Stream #{activeAuditOrder?.code}</SheetDescription>
                    </div>
                </div>
            </div>
          </div>
          <div className="p-16 space-y-24 bg-white pb-48">
            {activeAuditOrder?.order_events && activeAuditOrder.order_events.length > 0 ? (
              <div className="relative pl-16 space-y-24 before:absolute before:left-[23px] before:top-6 before:bottom-6 before:w-1.5 before:bg-slate-50 before:rounded-full">
                {activeAuditOrder.order_events
                  .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .map((event: any, i: number) => (
                  <div key={i} className="relative group/event">
                    <div className={cn(
                      "absolute -left-[54px] h-12 w-12 rounded-full border-[10px] border-white shadow-2xl z-10 transition-none",
                      event.status.includes('flagged') ? "bg-rose-500 shadow-rose-500/30" : "bg-brand-teal shadow-brand-teal/30"
                    )} />
                    <div className="space-y-8">
                      <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
                        <span className="text-lg font-black text-slate-900 uppercase tracking-widest leading-none">
                          {event.status.toUpperCase().replace(/_/g, ' ')}
                        </span>
                        <div className="h-1.5 w-12 bg-slate-50 rounded-full hidden md:block" />
                        <div className="flex items-center gap-4">
                            <Clock className="h-5 w-5 text-slate-200" />
                            <span className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em] tabular-nums leading-none">
                              {new Date(event.created_at).toLocaleString().toUpperCase()}
                            </span>
                        </div>
                      </div>
                      {event.note && (
                        <div className="p-12 bg-slate-50/50 rounded-[40px] border border-slate-50 shadow-sm">
                            <p className="text-base font-black text-slate-500 uppercase tracking-tight leading-relaxed italic border-l-4 border-slate-200 pl-8">
                              &quot;{event.note.toUpperCase()}&quot;
                            </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-80 gap-12 bg-slate-50/10 rounded-[48px] border border-dashed border-slate-100">
                <div className="h-40 w-40 rounded-full bg-white border border-slate-50 flex items-center justify-center shadow-2xl shadow-slate-900/5">
                    <Clock className="h-20 w-20 text-slate-100" />
                </div>
                <div className="text-center space-y-6">
                    <p className="text-sm font-black text-slate-400 uppercase tracking-[0.4em] leading-none">Registry Failure: No History Station</p>
                    <p className="text-[11px] font-black text-slate-200 uppercase tracking-[0.4em]">No operational events recorded for this terminal stream matrix.</p>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Flag Issue Dialog */}
      <Dialog open={flagDialogOpen} onOpenChange={setFlagDialogOpen}>
        <DialogContent className="max-w-[640px] rounded-[48px] border-none shadow-2xl p-16 bg-white transition-none overflow-hidden">
          <div className="absolute top-0 right-0 p-16 opacity-5">
              <ShieldAlert className="h-40 w-40" />
          </div>
          <DialogHeader className="space-y-10 relative">
            <div className="h-24 w-24 rounded-[32px] bg-rose-500/10 flex items-center justify-center border border-rose-500/20 shadow-2xl shadow-rose-500/10">
                <AlertTriangle className="h-12 w-12 text-rose-500" />
            </div>
            <div className="space-y-4">
                <DialogTitle className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">Flag Protocol Violation</DialogTitle>
                <div className="flex items-center gap-6">
                    <div className="h-2 w-12 bg-rose-500 rounded-full shadow-[0_0_12px_rgba(244,63,94,0.5)]" />
                    <DialogDescription className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em] leading-none">Record operational discrepancy for Stream #{activeFlagOrder?.code}.</DialogDescription>
                </div>
            </div>
          </DialogHeader>
          <div className="py-16 space-y-12 relative">
            <div className="grid gap-6">
              <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-300 pl-8">Protocol Violation Note Manifest</Label>
              <Textarea 
                placeholder="DESCRIBE THE OPERATIONAL DISCREPANCY IN EXHAUSTIVE DETAIL FOR AUDIT LOGGING..." 
                className="min-h-[260px] rounded-[40px] border-none bg-slate-50/50 font-black text-sm uppercase tracking-[0.2em] resize-none p-10 leading-relaxed focus-visible:ring-0 focus-visible:bg-white focus-visible:shadow-2xl shadow-slate-900/5 transition-none"
                value={flagNote}
                onChange={(e) => setFlagNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-8 pt-16 border-t border-slate-50 relative">
            <Button variant="ghost" className="rounded-full h-20 px-16 font-black text-[12px] uppercase tracking-widest text-slate-300 hover:bg-slate-50 transition-none border-none" onClick={() => setFlagDialogOpen(false)}>Abort_Flagging_Link</Button>
            <Button 
              className="h-20 px-20 bg-rose-600 hover:bg-rose-700 text-white rounded-full font-black text-[12px] uppercase tracking-widest shadow-2xl shadow-rose-600/30 gap-6 transition-none border-none" 
              onClick={handleFlagIssue}
              disabled={isSubmittingFlag || !flagNote.trim()}
            >
              {isSubmittingFlag ? <Loader2 className="h-7 w-7 animate-spin" /> : <ShieldCheck className="h-7 w-7" />}
              COMMIT_PROTOCOL_FLAG_SIGNAL
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PharmacyCombobox({
  orderId,
  currentPharmacyId,
  currentPharmacyName,
  deliveryArea,
  onAssign,
  loading,
  isUrgent,
}: {
  orderId: number;
  currentPharmacyId: number | null;
  currentPharmacyName?: string;
  deliveryArea?: string;
  onAssign: (orderId: number, pharmacyId: number, pharmacyName: string) => void;
  loading: boolean;
  isUrgent?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pharmacies, setPharmacies] = useState<
    { id: number; name: string; recommended?: boolean; is_24_7?: boolean }[]
  >([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (open) {
      setSearching(true);
      searchPharmacies("", deliveryArea).then((data) => {
        setPharmacies(data);
        setSearching(false);
      });
    }
  }, [open, deliveryArea]);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await searchPharmacies(searchQuery, deliveryArea);
        setPharmacies(data);
      } catch (e) {
        console.error(e);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, open, deliveryArea]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-8 px-10 py-4 rounded-full text-[11px] font-black uppercase tracking-widest border-none bg-slate-50 transition-none outline-none group/trigger shadow-sm hover:bg-slate-100",
            currentPharmacyId && "bg-white border-slate-100 border text-slate-900",
            isUrgent && !currentPharmacyId && "bg-rose-50 text-rose-500 shadow-2xl shadow-rose-500/10 border-rose-100 border"
          )}
          disabled={loading}
        >
          <div className="flex items-center gap-5 truncate">
            {isUrgent && !currentPharmacyId && (
               <div className="h-4 w-4 rounded-full bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.7)] animate-pulse" />
            )}
            <span className="truncate max-w-[200px]">
              {loading ? "ROUTING_STREAM..." : currentPharmacyName?.toUpperCase() || "ASSIGN_MASTER_NODE"}
            </span>
          </div>
          <ChevronsUpDown className="ml-6 h-6 w-6 shrink-0 text-slate-200 group-hover/trigger:text-slate-900 transition-none" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[480px] p-0 rounded-[40px] border-none shadow-2xl overflow-hidden bg-white transition-none z-[100]" align="start">
        <Command shouldFilter={false} className="bg-white">
          <div className="p-10 border-b border-slate-50 bg-slate-50/30 backdrop-blur-3xl">
            <div className="relative group">
                <Search className="absolute left-8 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-300 group-focus-within:text-brand-teal transition-none" />
                <CommandInput
                  placeholder="FILTER_NODE_REGISTRY_MATRIX..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  className="pl-18 h-16 border-none focus:ring-0 text-[12px] font-black uppercase tracking-[0.3em] bg-transparent text-slate-900"
                />
            </div>
          </div>
          <CommandList className="max-h-[520px] scrollbar-hide bg-white p-4">
            <CommandEmpty className="py-32 text-center text-[12px] font-black uppercase tracking-[0.3em] text-slate-200 px-16 leading-relaxed">
              {searching ? "SYNCHRONIZING_NODES_MATRIX..." : "MATRIX_SCAN_NOMINAL: NO MATCHING NODES DETECTED IN SECTOR."}
            </CommandEmpty>
            <CommandGroup>
              {pharmacies.map((pharmacy) => (
                <CommandItem
                  key={pharmacy.id}
                  value={pharmacy.name}
                  onSelect={() => {
                    onAssign(orderId, pharmacy.id, pharmacy.name);
                    setOpen(false);
                  }}
                  className="rounded-[32px] px-8 py-6 text-[12px] font-black uppercase tracking-widest flex items-center justify-between cursor-pointer transition-none aria-selected:bg-slate-900 aria-selected:text-white mb-3 last:mb-0 group/item shadow-sm"
                >
                  <div className="flex items-center gap-6">
                    <div className={cn(
                        "h-12 w-12 rounded-full border-2 flex items-center justify-center transition-none",
                        currentPharmacyId === pharmacy.id ? "bg-brand-teal/10 border-brand-teal text-brand-teal shadow-[0_0_10px_rgba(20,184,166,0.4)]" : "bg-white border-slate-100 text-slate-100 group-hover/item:border-slate-200"
                    )}>
                        <Check className="h-6 w-6" />
                    </div>
                    <span className="truncate max-w-[260px]">{pharmacy.name.toUpperCase()}</span>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    {pharmacy.is_24_7 && (
                      <div className="bg-sky-500/10 text-sky-600 rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-widest border-none">24/7_UP</div>
                    )}
                    {pharmacy.recommended && (
                      <div className="bg-emerald-500/10 text-emerald-600 rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-widest border-none">OPTIMAL_SYNC</div>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
