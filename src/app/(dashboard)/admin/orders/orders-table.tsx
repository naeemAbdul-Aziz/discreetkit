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
  AlertCircle,
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
import {
  dashboardTable,
  ordersTableCols,
  actions as actionStyles,
} from "@/components/ui/table-layout";

// Helper
const titleCase = (s: string) =>
  s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());


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

  // Rider Assignment State
  const [riderDialogOpen, setRiderDialogOpen] = useState(false);
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState<{
    id: number;
    status: string;
    forceOverride?: boolean;
  } | null>(null);
  const [riderName, setRiderName] = useState("");
  const [riderPhone, setRiderPhone] = useState("");

  // Messaging State
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [activeMessageOrderId, setActiveMessageOrderId] = useState<
    number | null
  >(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = (id: number) => {
    const next = new Set(expandedRows);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedRows(next);
  };

  // Override State
  const [overridePrompt, setOverridePrompt] = useState<{
    orderId: number;
    newStatus: string;
    pharmacyName: string;
  } | null>(null);

  // New Operational States
  const [auditSheetOpen, setAuditSheetOpen] = useState(false);
  const [activeAuditOrder, setActiveAuditOrder] = useState<any>(null);
  const [flagDialogOpen, setFlagDialogOpen] = useState(false);
  const [activeFlagOrder, setActiveFlagOrder] = useState<any>(null);
  const [flagNote, setFlagNote] = useState("");
  const [isSubmittingFlag, setIsSubmittingFlag] = useState(false);

  const handleFlagIssue = async () => {
    if (!activeFlagOrder || !flagNote.trim()) return;
    setIsSubmittingFlag(true);
    const res = await flagOrderIssue(activeFlagOrder.id, flagNote);
    setIsSubmittingFlag(false);
    if (res.success) {
      toast({ title: "Issue Flagged", description: "Successfully logged the operational issue." });
      setFlagDialogOpen(false);
      setFlagNote("");
    } else {
      toast({ variant: "destructive", title: "Action Failed", description: res.error });
    }
  };

  const [bulkOverridePrompt, setBulkOverridePrompt] = useState<{
    status: string;
    restrictedCount: number;
    totalCount: number;
  } | null>(null);

  // Pagination logic consolidated below

  // Filter logic
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        o.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.email || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || o.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, filterStatus]);

  const totalPages = Math.ceil(totalOrders / limit);
  // We use initialOrders directly as it is already filtered/sliced by the server
  const paginatedOrders = filteredOrders;

  const handlePageChange = (newPage: number) => {
    startTransition(() => {
        const params = new URLSearchParams(window.location.search);
        params.set("page", newPage.toString());
        params.set("limit", limit.toString());
        router.push(`/admin/orders?${params.toString()}`);
    });
  };

  const handleLimitChange = (newLimit: number) => {
    startTransition(() => {
        const params = new URLSearchParams(window.location.search);
        params.set("page", "1");
        params.set("limit", newLimit.toString());
        router.push(`/admin/orders?${params.toString()}`);
    });
  };

  // Realtime Subscription
  useEffect(() => {
    const supabase = getSupabaseClient();
    const channel = supabase
      .channel("admin-orders-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload: any) => {
          // Handle UPDATE
          if (payload.eventType === "UPDATE") {
            const updatedOrder = payload.new;
            setOrders((prev) =>
              prev.map((o) => {
                if (o.id === updatedOrder.id) {
                  return {
                    ...o,
                    ...updatedOrder,
                    pharmacies: o.pharmacies,
                    order_events: o.order_events, // Preserve events
                  };
                }
                return o;
              }),
            );
            toast({
              title: "Order Updated",
              description: `Order ${updatedOrder.code || ""} status changed to ${updatedOrder.status}`,
            });
          }
          // Handle INSERT (New Order)
          else if (payload.eventType === "INSERT") {
            const newOrder = {
              ...payload.new,
              pharmacies: null,
              order_events: [],
            };
            setOrders((prev) => [newOrder, ...prev]);
            toast({
              title: "New Order Received",
              description: `Order ${newOrder.code} has been placed.`,
            });
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
                // Prevent duplicate if already added
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
  }, [toast]);

  // Sync props to state (CRITICAL for revalidatePath to work in Client Components)
  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  const handleStatusChangeClick = (orderId: number, newStatus: string) => {
    const currentOrder = orders.find((o) => o.id === orderId);

    // Check if it's an assigned order and a restricted status update
    const isRestrictedTransition =
      !!currentOrder?.pharmacy_id &&
      ["processing", "out_for_delivery", "completed"].includes(newStatus);

    if (isRestrictedTransition) {
      setOverridePrompt({
        orderId,
        newStatus,
        pharmacyName: currentOrder?.pharmacies?.name || "Assigned Pharmacy",
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
    // Optimistic update
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

    const { updateOrderStatus } = await import("@/lib/admin-actions");
    const res = await updateOrderStatus(
      orderId,
      newStatus,
      courierDetails,
      forceOverride,
    );

    if (res.error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: res.error,
      });
      startTransition(() => {
        router.refresh();
      });
    } else {
      toast({
        title: "Status Updated",
        description: `Order status changed to ${titleCase(newStatus)}`,
      });
      // Ensure server component data is refreshed too
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
    const { bulkUpdateOrderStatus } = await import("@/lib/admin-actions");
    const res = await bulkUpdateOrderStatus(
      Array.from(selectedIds),
      status,
      forceOverride,
    );
    if (res.error) {
      toast({
        variant: "destructive",
        title: "Bulk update failed",
        description: res.error,
      });
    } else {
      toast({
        title: "Bulk Updated",
        description: res.warning
          ? res.warning
          : `Set orders to ${titleCase(status)}`,
      });
      // Optimistic update
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
          title: "Pharmacy Assigned",
          description: `Order assigned to ${pharmacyName}`,
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
          title: "Assignment Failed",
          description: res.error,
        });
      }
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to assign pharmacy",
      });
    } finally {
      setAssigningId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const base = titleCase(status);
    // Premium, demure, monochromatic and subtle accent palette
    switch (status) {
      case "completed":
        return (
          <Badge variant="success" className="gap-1 bg-slate-50 text-slate-800 border-slate-200 font-bold uppercase text-[9px] tracking-widest px-2 py-0.5">
            <CheckCircle className="h-3 w-3 text-emerald-600/70" />
            {base}
          </Badge>
        );
      case "processing":
        return (
          <Badge variant="secondary" className="gap-1 bg-slate-50 text-slate-600 border-slate-200/60 font-bold uppercase text-[9px] tracking-widest px-2 py-0.5">
            <Package className="h-3 w-3 text-slate-400" />
            {base}
          </Badge>
        );
      case "out_for_delivery":
        return (
          <Badge variant="warning" className="gap-1 bg-slate-50 text-slate-700 border-slate-200 font-bold uppercase text-[9px] tracking-widest px-2 py-0.5">
            <Truck className="h-3 w-3 text-indigo-500/70" />
            {base}
          </Badge>
        );
      case "pending_payment":
        return (
          <Badge variant="pending" className="gap-1 bg-white text-slate-500 border-slate-200/50 font-bold uppercase text-[9px] tracking-widest px-2 py-0.5 shadow-sm">
            <CreditCard className="h-3 w-3 text-slate-300" />
            {base}
          </Badge>
        );
      case "received":
        return (
          <Badge variant="info" className="gap-1 bg-slate-50 text-slate-600 border-slate-200/60 font-bold uppercase text-[9px] tracking-widest px-2 py-0.5">
            <Clock className="h-3 w-3 text-slate-400" />
            {base}
          </Badge>
        );
      default:
        return <Badge variant="outline" className="font-bold uppercase text-[9px] tracking-widest px-2 py-0.5 border-slate-100 text-slate-400">{base}</Badge>;
    }
  };

  // Dialog components are now imported at the top

  return (
    <div className="space-y-4">
      {/* Rider Info Component */}
      <RiderHover />

      {/* Override Dialog */}
      <Dialog
        open={!!overridePrompt}
        onOpenChange={(open) => !open && setOverridePrompt(null)}
        modal={false}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Override Workflow
            </DialogTitle>
            <DialogDescription>
              This order belongs to{" "}
              <span className="font-semibold text-foreground">
                {overridePrompt?.pharmacyName}
              </span>
              . The pharmacy is normally responsible for moving the status to{" "}
              {overridePrompt ? titleCase(overridePrompt.newStatus) : ""}.
              <br />
              <br />
              Are you sure you want to force this status update and override
              their workflow?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOverridePrompt(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmOverride}>
              Force Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Override Dialog */}
      <Dialog
        open={!!bulkOverridePrompt}
        onOpenChange={(open) => !open && setBulkOverridePrompt(null)}
        modal={false}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Override Workflow
            </DialogTitle>
            <DialogDescription>
              {bulkOverridePrompt?.restrictedCount} of the{" "}
              {bulkOverridePrompt?.totalCount} selected orders are assigned to
              pharmacies. Pharmacies usually handle{" "}
              {bulkOverridePrompt ? titleCase(bulkOverridePrompt.status) : ""}{" "}
              updates.
              <br />
              <br />
              Do you want to override and force the update on these orders
              anyway?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBulkOverridePrompt(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (bulkOverridePrompt) {
                  executeBulkStatusChange(bulkOverridePrompt.status, true);
                  setBulkOverridePrompt(null);
                }
              }}
            >
              Force Update All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rider Dialog */}
      <Dialog
        open={riderDialogOpen}
        onOpenChange={setRiderDialogOpen}
        modal={false}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Assign Dispatch Rider</DialogTitle>
            <DialogDescription>
              Enter the details of the rider delivering this order. This will be
              visible to the customer.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={riderName}
                onChange={(e) => setRiderName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                value={riderPhone}
                onChange={(e) => setRiderPhone(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRiderDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmRiderAssignment}
              disabled={!riderName || !riderPhone}
            >
              Assign & Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Message Dialog */}
      <Dialog
        open={messageDialogOpen}
        onOpenChange={setMessageDialogOpen}
        modal={false}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Pharmacy Chat</DialogTitle>
            <DialogDescription>
              Communicate with the pharmacy regarding this order.
            </DialogDescription>
          </DialogHeader>
          {activeMessageOrderId && (
            <OrderMessages orderId={activeMessageOrderId} userRole="admin" />
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Pharmacy Dialog */}
      <Dialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        modal={false}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Assign Pharmacy</DialogTitle>
            <DialogDescription>
              Select a pharmacy to assign this order to.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {activeAssignOrder && (
              <PharmacyCombobox
                orderId={activeAssignOrder.id}
                currentPharmacyId={activeAssignOrder.pharmacyId}
                // Pass dummy props or just ignore name for now since Combobox handles search
                currentPharmacyName={""}
                onAssign={(oid, pid, pname) => {
                  handleAssignPharmacy(oid, pid, pname);
                  setAssignDialogOpen(false);
                }}
                loading={assigningId === activeAssignOrder.id}
              />
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAssignDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedIds.size > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 p-2 rounded border bg-muted/40">
          <span className="text-sm">{selectedIds.size} selected</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="secondary" disabled={bulkSaving}>
                Change Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {[
                "pending_payment",
                "received",
                "processing",
                "out_for_delivery",
                "completed",
              ].map((s) => (
                <DropdownMenuItem
                  key={s}
                  disabled={bulkSaving}
                  onClick={() => {
                    const isRestrictedTransition = [
                      "processing",
                      "out_for_delivery",
                      "completed",
                    ].includes(s);
                    const selectedOrdersWithPharmacies = orders.filter(
                      (o) => selectedIds.has(o.id) && o.pharmacy_id,
                    );

                    if (
                      isRestrictedTransition &&
                      selectedOrdersWithPharmacies.length > 0
                    ) {
                      setBulkOverridePrompt({
                        status: s,
                        restrictedCount: selectedOrdersWithPharmacies.length,
                        totalCount: selectedIds.size,
                      });
                    } else {
                      executeBulkStatusChange(s, false);
                    }
                  }}
                >
                  {titleCase(s)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelectedIds(new Set())}
          >
            Clear
          </Button>
        </div>
      )}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 flex-wrap">
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
        <div className="flex items-center gap-2 text-sm">
          {[
            "all",
            "pending_payment",
            "received",
            "processing",
            "out_for_delivery",
            "completed",
          ].map((s) => (
            <Button
              key={s}
              variant={filterStatus === s ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus(s)}
            >
              {s === "all" ? "All" : titleCase(s)}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />}
          <Button variant="outline" size="sm" onClick={handleManualRefresh} disabled={isPending}>
             Refresh
          </Button>
        </div>
      </div>

      <div className={dashboardTable.container}>
        <Table className={cn(dashboardTable.table, "min-w-[900px]")}>
          <TableHeader>
            <TableRow>
              <TableHead className={ordersTableCols.checkbox}>
                <input
                  type="checkbox"
                  aria-label="Select all"
                  checked={
                    filteredOrders.length > 0 &&
                    filteredOrders.every((o) => selectedIds.has(o.id))
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedIds(new Set(filteredOrders.map((o) => o.id)));
                    } else {
                      setSelectedIds(new Set());
                    }
                  }}
                  className="h-4 w-4 rounded border"
                />
              </TableHead>
              <TableHead className={ordersTableCols.codeHead}>
                Order ID
              </TableHead>
              <TableHead className={ordersTableCols.dateHead}>Date</TableHead>
              <TableHead className={ordersTableCols.customerHead}>
                Customer
              </TableHead>
              <TableHead className={ordersTableCols.noteHead}>Note</TableHead>
              <TableHead className={ordersTableCols.statusHead}>
                Status
              </TableHead>
              <TableHead className={ordersTableCols.pharmacyHead}>
                Pharmacy
              </TableHead>
              <TableHead className={ordersTableCols.totalHead}>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TooltipProvider>
              {paginatedOrders.map((order) => {
                const isExpanded = expandedRows.has(order.id);
                const isDelayedUnassigned = !order.pharmacy_id && 
                  (new Date().getTime() - new Date(order.created_at).getTime()) > 15 * 60 * 1000;
                
                return (
                  <React.Fragment key={order.id}>
                    <TableRow
                      className={cn(
                        "transition-colors hover:bg-slate-50/50 cursor-pointer group",
                        selectedIds.has(order.id) && "bg-muted/30",
                        isExpanded && "bg-slate-50 border-b-0"
                      )}
                      onClick={() => toggleRow(order.id)}
                    >
                      <TableCell className={cn(ordersTableCols.checkbox, "relative")} onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                           <button className="text-slate-400 group-hover:text-brand-indigo transition-colors" title={isExpanded ? "Collapse" : "Expand"}>
                             {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                           </button>
                          <input
                            type="checkbox"
                            aria-label={`Select order ${order.code}`}
                            checked={selectedIds.has(order.id)}
                            onChange={(e) => {
                              setSelectedIds((prev) => {
                                const next = new Set(prev);
                                if (e.target.checked) next.add(order.id);
                                else next.delete(order.id);
                                return next;
                              });
                            }}
                            className="h-4 w-4 rounded border"
                          />
                        </div>
                      </TableCell>
                      <TableCell className={cn(ordersTableCols.codeCell, "font-mono font-bold text-slate-600 group-hover:text-brand-indigo transition-colors")}>
                        {order.code}
                      </TableCell>
                      <TableCell className={ordersTableCols.dateCell}>
                        {new Date(order.created_at).toISOString().slice(0, 10)}
                      </TableCell>
                      <TableCell className={ordersTableCols.customerCell}>
                        {order.email || "Anonymous"}
                      </TableCell>
                      <TableCell className={ordersTableCols.noteCell} onClick={(e) => e.stopPropagation()}>
                        {order.delivery_address_note ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 px-2 text-[10px] uppercase font-bold tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100/50 rounded-full"
                              >
                                View Note
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[300px] p-3 text-xs bg-white/80 backdrop-blur-md border-slate-200 shadow-xl text-slate-600 font-medium leading-relaxed">
                              {order.delivery_address_note}
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <span className="text-slate-300 text-[10px]">EMPTY</span>
                        )}
                      </TableCell>
                      <TableCell className={ordersTableCols.statusCell} onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="-ml-2 px-2 h-8 items-center w-fit justify-start focus-visible:ring-0 hover:bg-transparent"
                              >
                                {getStatusBadge(order.status)}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-[200px]">
                              <DropdownMenuItem
                                onSelect={(e) => {
                                  e.preventDefault();
                                  setActiveMessageOrderId(order.id);
                                  setMessageDialogOpen(true);
                                }}
                              >
                                <MessageSquare className="mr-2 h-4 w-4" />
                                <span>Chat with Pharmacy</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
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
                                >
                                  {titleCase(s)}
                                </DropdownMenuItem>
                              ))}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setActiveAssignOrder({
                                    id: order.id,
                                    pharmacyId: order.pharmacy_id,
                                  });
                                  setAssignDialogOpen(true);
                                }}
                              >
                                Assign Pharmacy
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>

                          {order.status === "out_for_delivery" && order.courier_name && (
                            <Popover>
                              <PopoverTrigger asChild>
                                <button
                                  className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-100 hover:bg-amber-100 transition-all flex items-center gap-1.5"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                  {order.courier_name}
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-64 p-0 border-none bg-white rounded-[2rem] shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                                <div className="p-5 bg-amber-50/50 border-b border-amber-100 flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-inner">
                                    <Truck className="h-6 w-6" />
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Assigned Rider</p>
                                    <p className="text-sm font-bold text-slate-900">{order.courier_name}</p>
                                  </div>
                                </div>
                                <div className="p-5 space-y-4">
                                  <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Contact Number</p>
                                      <p className="text-sm font-bold text-slate-700 tabular-nums">{order.courier_phone}</p>
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-9 w-9 rounded-xl border-slate-100 bg-slate-50 hover:bg-white transition-all text-indigo-600"
                                      onClick={() => {
                                        navigator.clipboard.writeText(order.courier_phone || "");
                                        toast({ title: "Copied!", description: "Rider contact number saved to clipboard." });
                                      }}
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <Button
                                    asChild
                                    className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-brand-indigo/90 font-bold text-xs uppercase tracking-widest gap-2 shadow-lg shadow-brand-indigo/20"
                                  >
                                    <a href={`tel:${order.courier_phone}`}>
                                      Call Dispatcher
                                    </a>
                                  </Button>
                                </div>
                              </PopoverContent>
                            </Popover>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className={cn(ordersTableCols.pharmacyCell)} onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
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
                                <AlertCircle className="h-4 w-4 text-rose-500" />
                              </TooltipTrigger>
                              <TooltipContent className="bg-rose-600 text-white border-0 text-[11px] font-bold">
                                Declined by Pharmacy
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className={cn(ordersTableCols.totalCell, "font-bold tabular-nums text-slate-700")}>
                        GHS {Number(order.total_price_ghs || order.total_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                    
                    {/* Expanded Detail View */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <TableRow className="bg-slate-50/30 border-t-0 hover:bg-slate-50/50 transition-colors">
                          <TableCell colSpan={8} className="p-0 overflow-hidden">
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ type: "spring", duration: 0.4, bounce: 0.1 }}
                            >
                              <div className="mx-6 my-4 p-8 grid grid-cols-1 md:grid-cols-3 gap-10 bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04),inset_0_0_0_1px_rgba(0,0,0,0.03)] border border-slate-100 relative overflow-hidden group/detail">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-indigo opacity-80" />
                                
                                {/* Col 1: Customer & Logistics */}
                                <div className="space-y-6">
                                  <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-indigo-600">
                                      <User className="h-3.5 w-3.5" />
                                      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Customer Details</h4>
                                    </div>
                                    <div className="pl-5 border-l border-slate-100 space-y-1">
                                      <p className="text-base font-bold text-slate-900 tracking-tight">{order.email || "Anonymous Patient"}</p>
                                      <div className="flex items-center gap-3">
                                        <p className="text-xs font-bold text-slate-400 tabular-nums">Order ID: {order.id}</p>
                                        <span className="text-slate-200">|</span>
                                        <p className="text-xs font-bold text-slate-500 tabular-nums">{order.phone_masked || "No Phone Provided"}</p>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-indigo-600">
                                      <MapPin className="h-3.5 w-3.5" />
                                      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Delivery Address</h4>
                                    </div>
                                    <div className="pl-5 border-l border-slate-100 space-y-3">
                                      <p className="text-sm font-bold text-slate-700">{order.delivery_area || "Standard Zone"}</p>
                                      <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100/50 relative group/note">
                                        <div className="absolute -top-2 left-3 px-2 bg-white border border-slate-100 rounded-md text-[8px] font-bold uppercase tracking-tighter text-slate-400">Recipient Note</div>
                                        <p className="text-[11px] font-medium text-slate-500 italic leading-relaxed">
                                          &quot;{order.delivery_address_note || "No specific delivery notes provided."}&quot;
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Col 2: Inventory Summary */}
                                <div className="space-y-6">
                                  <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-indigo-600">
                                      <Package className="h-3.5 w-3.5" />
                                      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Order Items</h4>
                                    </div>
                                  <div className="pl-5 border-l border-slate-100 space-y-2">
                                    {(() => {
                                      const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
                                      const itemsArray = Array.isArray(items) ? items : [];
                                      return (
                                        <div className="space-y-2">
                                          {itemsArray.slice(0, 3).map((item: any, i: number) => (
                                            <div key={i} className="flex justify-between items-center text-[11px] font-bold text-slate-600">
                                              <span className="truncate max-w-[120px]">{item.name}</span>
                                              <span className="text-slate-400 tabular-nums">x{item.quantity}</span>
                                            </div>
                                          ))}
                                          {itemsArray.length > 3 && (
                                            <p className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest pt-1">+{itemsArray.length - 3} additional items</p>
                                          )}
                                        </div>
                                      );
                                    })()}
                                  </div>
                                </div>
                                
                                <div className="space-y-4">
                                  <div className="flex items-center gap-2 text-indigo-600">
                                    <CreditCard className="h-3.5 w-3.5" />
                                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Payment Summary</h4>
                                  </div>
                                  <div className="pl-5 border-l border-slate-100 space-y-1">
                                    <p className="text-sm font-bold text-slate-900 tracking-tight">₵{Number(order.total_price_ghs || order.total_price || 0).toFixed(2)}</p>
                                    <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Cash on Delivery</p>
                                  </div>
                                </div>
                                </div>

                                {/* Col 3: Operational Controls */}
                                <div className="space-y-6 bg-slate-50/40 p-6 rounded-[2rem] border border-slate-100/50">
                                  <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-indigo-600">
                                      <GanttChartSquare className="h-3.5 w-3.5" />
                                      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Assigned Pharmacy</h4>
                                    </div>
                                    <div className="space-y-3">
                                      <div className="flex items-center justify-between">
                                        <p className="text-xs font-bold text-slate-900">{order.pharmacies?.name || "No Partner Assigned"}</p>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-indigo-600 hover:bg-brand-indigo/10" onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveMessageOrderId(order.id);
                                          setMessageDialogOpen(true);
                                        }}>
                                          <MessageSquare className="h-4 w-4" />
                                        </Button>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2">
                                        <Button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveAuditOrder(order);
                                            setAuditSheetOpen(true);
                                          }}
                                          size="sm" 
                                          className="h-9 rounded-xl bg-indigo-600 hover:bg-brand-indigo/90 font-bold text-[9px] uppercase tracking-widest shadow-lg shadow-brand-indigo/20"
                                        >
                                          Audit Trail
                                        </Button>
                                        <Button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveFlagOrder(order);
                                            setFlagDialogOpen(true);
                                          }}
                                          variant="outline" 
                                          size="sm" 
                                          className="h-9 rounded-xl border-slate-200 bg-white hover:bg-slate-50 font-bold text-[9px] uppercase tracking-widest text-slate-600"
                                        >
                                          Flag Issue
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="pt-4 border-t border-slate-200/50">
                                    <Button asChild variant="link" className="px-0 h-auto text-indigo-600 text-[10px] font-bold uppercase tracking-[0.2em] hover:no-underline hover:opacity-70 gap-2 group/link">
                                      <a href={`/admin/orders/${order.id}`}>
                                        View Full Order Details
                                        <ChevronRight className="h-3 w-3 transition-transform group-hover/link:translate-x-1" />
                                      </a>
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          </TableCell>
                        </TableRow>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                );
              })}
            </TooltipProvider>
            {filteredOrders.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-4 text-slate-400">
                    <div className="bg-slate-50 p-6 rounded-full border-2 border-dashed border-slate-200">
                      <XCircle className="h-10 w-10 opacity-20" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-slate-600 uppercase tracking-widest">No Results Found</h3>
                      <p className="text-xs font-medium">Clear your filters to search all orders.</p>
                    </div>
                    {filterStatus !== "all" || searchTerm !== "" ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 font-bold text-[10px] uppercase tracking-widest gap-2"
                        onClick={() => {
                          setSearchTerm("");
                          setFilterStatus("all");
                        }}
                      >
                        <Filter className="h-3 w-3" /> Clear Filters
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalOrders > limit && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 px-4 py-4 bg-slate-50/50 rounded-2xl border border-slate-100 gap-4">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Results per page</span>
            <select
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm focus:ring-2 focus:ring-brand-indigo/20 outline-none transition-all"
              value={limit}
              onChange={(e) => handleLimitChange(Number(e.target.value))}
            >
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size} ROWS
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              className="h-9 w-9 p-0 rounded-xl border-slate-200 hover:bg-white hover:text-brand-indigo font-bold shadow-sm disabled:opacity-30"
              disabled={page <= 1}
              onClick={() => handlePageChange(page - 1)}
            >
              &lt;
            </Button>
            <div className="flex items-center px-4 h-9 bg-white border border-slate-200 rounded-xl shadow-sm">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2">Vantage</span>
                <span className="text-xs font-black text-slate-900">{page}</span>
                <span className="text-[10px] font-black text-slate-300 mx-2">/</span>
                <span className="text-xs font-black text-slate-500">{totalPages}</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-9 w-9 p-0 rounded-xl border-slate-200 hover:bg-white hover:text-brand-indigo font-bold shadow-sm disabled:opacity-30"
              disabled={page >= totalPages}
              onClick={() => handlePageChange(page + 1)}
            >
              &gt;
            </Button>
          </div>
        </div>
      )}
      {/* Audit Trail Sheet */}
      <Sheet open={auditSheetOpen} onOpenChange={setAuditSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader className="pb-6 border-b">
            <SheetTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-600" />
              Order Audit Trail
            </SheetTitle>
            <SheetDescription className="text-xs font-medium">
              Complete operational history for Order #{activeAuditOrder?.id}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-8 space-y-6">
            {activeAuditOrder?.order_events && activeAuditOrder.order_events.length > 0 ? (
              <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                {activeAuditOrder.order_events
                  .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .map((event: any, i: number) => (
                  <div key={i} className="relative group">
                    <div className={cn(
                      "absolute -left-6 h-4 w-4 rounded-full border-2 border-white shadow-sm ring-4 ring-white z-10",
                      event.status.includes('flagged') ? "bg-rose-500" : "bg-emerald-500"
                    )} />
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">
                          {event.status.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400">
                          {new Date(event.created_at).toLocaleString()}
                        </span>
                      </div>
                      {event.note && (
                        <p className="text-xs text-slate-500 font-medium leading-relaxed italic">
                          &quot;{event.note}&quot;
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-2">
                <Clock className="h-8 w-8 opacity-20" />
                <p className="text-xs font-bold uppercase tracking-widest">No history recorded</p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Flag Issue Dialog */}
      <Dialog open={flagDialogOpen} onOpenChange={setFlagDialogOpen}>
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold uppercase tracking-widest">Flag Operational Issue</DialogTitle>
            <DialogDescription className="text-xs font-medium">
              Record an issue or discrepancy regarding Order #{activeFlagOrder?.id}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-slate-400">Reason / Note</Label>
              <Textarea 
                placeholder="e.g. Rider delayed, items missing, pharmacy uncontactable..." 
                className="min-h-[100px] text-xs font-medium resize-none"
                value={flagNote}
                onChange={(e) => setFlagNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" className="text-xs font-bold" onClick={() => setFlagDialogOpen(false)}>Cancel</Button>
            <Button 
              className="bg-rose-600 hover:bg-rose-700 text-xs font-bold gap-2" 
              onClick={handleFlagIssue}
              disabled={isSubmittingFlag || !flagNote.trim()}
            >
              {isSubmittingFlag && <Loader2 className="h-3 w-3 animate-spin" />}
              Submit Flag
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

  // Load pharmacies when popover opens
  useEffect(() => {
    if (open) {
      setSearching(true);
      searchPharmacies("", deliveryArea).then((data) => {
        setPharmacies(data);
        setSearching(false);
      });
    }
  }, [open, deliveryArea]);

  // Debounced search
  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(async () => {
      if (searchQuery) {
        setSearching(true);
        try {
          const data = await searchPharmacies(searchQuery, deliveryArea);
          setPharmacies(data);
        } catch (e) {
          console.error(e);
        } finally {
          setSearching(false);
        }
      } else {
        // Reset to initial recommendations
        setSearching(true);
        searchPharmacies("", deliveryArea).then((data) => {
          setPharmacies(data);
          setSearching(false);
        });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, open, deliveryArea]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-40 h-8 justify-between items-center transition-all duration-300",
            !currentPharmacyId && "border-slate-200/60 bg-slate-50/30 hover:bg-slate-100/50",
            isUrgent && !currentPharmacyId && "border-slate-200/80"
          )}
          size="sm"
          disabled={loading}
        >
          <div className="flex items-center gap-2 truncate">
            {isUrgent && !currentPharmacyId && (
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
              </span>
            )}
            <span className={cn("truncate font-bold tracking-tight", !currentPharmacyId && (isUrgent ? "text-rose-600" : "text-slate-400"))}>
              {loading ? "Assigning..." : currentPharmacyName || "UNASSIGNED"}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search pharmacy..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>
              {searching ? "Searching..." : "No pharmacy found."}
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
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Check
                      className={cn(
                        "h-4 w-4",
                        currentPharmacyId === pharmacy.id
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    <span className="truncate">{pharmacy.name}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {pharmacy.is_24_7 && (
                      <Badge
                        variant="secondary"
                        className="h-5 text-[10px] px-1 bg-blue-100 text-blue-700"
                      >
                        24/7
                      </Badge>
                    )}
                    {pharmacy.recommended && (
                      <Badge
                        variant="secondary"
                        className="h-5 text-[10px] px-1 bg-green-100 text-green-700"
                      >
                        Best
                      </Badge>
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

function RiderHover() {
  return null; // Interface is natively integrated for performance
}
