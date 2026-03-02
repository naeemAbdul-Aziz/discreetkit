"use client";

import { useState, useEffect, useMemo } from "react";
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
} from "lucide-react";
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
} from "@/lib/admin-actions";
import { getSupabaseClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import {
  dashboardTable,
  ordersTableCols,
  actions as actionStyles,
} from "@/components/ui/table-layout";

// Helper
const titleCase = (s: string) =>
  s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export function OrdersTable({ initialOrders }: { initialOrders: any[] }) {
  const router = useRouter();
  const { toast } = useToast();
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

  // Override State
  const [overridePrompt, setOverridePrompt] = useState<{
    orderId: number;
    newStatus: string;
    pharmacyName: string;
  } | null>(null);

  const [bulkOverridePrompt, setBulkOverridePrompt] = useState<{
    status: string;
    restrictedCount: number;
    totalCount: number;
  } | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const paginatedOrders = filteredOrders.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

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
      router.refresh();
    } else {
      toast({
        title: "Status Updated",
        description: `Order status changed to ${titleCase(newStatus)}`,
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
    switch (status) {
      case "completed":
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            {base}
          </Badge>
        );
      case "processing":
        return (
          <Badge variant="secondary" className="gap-1">
            <Package className="h-3 w-3" />
            {base}
          </Badge>
        );
      case "out_for_delivery":
        return (
          <Badge variant="warning" className="gap-1">
            <Truck className="h-3 w-3" />
            {base}
          </Badge>
        );
      case "pending_payment":
        return (
          <Badge variant="pending" className="gap-1">
            <CreditCard className="h-3 w-3" />
            {base}
          </Badge>
        );
      case "received":
        return (
          <Badge variant="info" className="gap-1">
            <Clock className="h-3 w-3" />
            {base}
          </Badge>
        );
      default:
        return <Badge variant="outline">{base}</Badge>;
    }
  };

  // Dialog components are now imported at the top

  return (
    <div className="space-y-4">
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
      </div>

      <div className={dashboardTable.container}>
        <Table className="min-w-[600px] table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">
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
            {paginatedOrders.map((order) => (
              <TableRow
                key={order.id}
                className={selectedIds.has(order.id) ? "bg-muted/30" : ""}
              >
                <TableCell>
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
                </TableCell>
                <TableCell className={ordersTableCols.codeCell}>
                  {order.code}
                </TableCell>
                <TableCell className={ordersTableCols.dateCell}>
                  {new Date(order.created_at).toISOString().slice(0, 10)}
                </TableCell>
                <TableCell className={ordersTableCols.customerCell}>
                  {order.email || "Anonymous"}
                </TableCell>
                <TableCell className={ordersTableCols.noteCell}>
                  {order.delivery_address_note ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="text-xs">
                          View Note
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="max-w-[360px] text-sm">
                        {order.delivery_address_note}
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </TableCell>
                <TableCell className={ordersTableCols.statusCell}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="px-2 h-8 items-center"
                        title={
                          order.status === "out_for_delivery" &&
                          order.courier_name
                            ? `Rider: ${order.courier_name} (${order.courier_phone || "No phone"})`
                            : undefined
                        }
                      >
                        <span className="inline-flex items-center gap-2">
                          {getStatusBadge(order.status)}
                          {order.status === "out_for_delivery" &&
                            order.courier_name && (
                              <span className="text-[10px] text-muted-foreground truncate max-w-[100px]">
                                🚚 {order.courier_name}
                              </span>
                            )}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem
                        onClick={() => {
                          setActiveMessageOrderId(order.id);
                          setMessageDialogOpen(true);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          <span>Chat with Pharmacy</span>
                        </div>
                      </DropdownMenuItem>
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
                </TableCell>
                <TableCell className={ordersTableCols.pharmacyCell}>
                  <div className="flex items-center gap-2">
                    <PharmacyCombobox
                      orderId={order.id}
                      currentPharmacyId={order.pharmacy_id}
                      currentPharmacyName={order.pharmacies?.name}
                      deliveryArea={order.delivery_area}
                      onAssign={handleAssignPharmacy}
                      loading={assigningId === order.id}
                    />
                    {order.pharmacy_ack_status === "declined" && (
                      <div className="relative group cursor-help">
                        <AlertCircle className="h-4 w-4 text-destructive" />
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-destructive text-destructive-foreground text-xs rounded shadow-lg z-50 pointer-events-none">
                          {(() => {
                            // Find the decline event - look for "acknowledge" + "declined" in note OR status "Pharmacy Declined"
                            const declineEvent = order.order_events
                              ?.filter((e: any) => {
                                const note = (e.note || "").toLowerCase();
                                const status = (e.status || "").toLowerCase();
                                return (
                                  (note.includes("acknowledge") &&
                                    note.includes("declined")) ||
                                  status === "pharmacy declined"
                                );
                              })
                              .sort(
                                (a: any, b: any) =>
                                  new Date(b.created_at).getTime() -
                                  new Date(a.created_at).getTime(),
                              )[0];

                            if (!declineEvent || !declineEvent.note)
                              return "Order declined by pharmacy";

                            const note = declineEvent.note;

                            // Pattern 1: "Pharmacy acknowledge: declined - [Reason]"
                            const prefix1 = "Pharmacy acknowledge: declined - ";
                            if (note.includes(prefix1)) {
                              return note.split(prefix1)[1];
                            }

                            // Pattern 2: "Pharmacy Declined - [Reason]" (if we used that)
                            // Pattern 3: Simple split by " - " if it looks like a structured message
                            if (note.includes(" - ")) {
                              const parts = note.split(" - ");
                              // Return the last part as the reason
                              return parts[parts.length - 1];
                            }

                            return note;
                          })()}
                          <div className="absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 bg-destructive rotate-45"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className={ordersTableCols.totalCell}>
                  GHS {Number(order.total_price || 0).toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
            {filteredOrders.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <span className="text-sm">
                      No orders match your criteria.
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {filteredOrders.length > pageSize && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-2 gap-2">
          {/* ... existing pagination ... */}
          <div className="flex items-center gap-2">
            <span className="text-sm">Rows per page:</span>
            <select
              className="border rounded px-2 py-1 text-sm"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              title="Rows per page"
            >
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              &lt;
            </Button>
            <span className="text-sm">
              Page {page} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="ghost"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              &gt;
            </Button>
          </div>
        </div>
      )}
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
}: {
  orderId: number;
  currentPharmacyId: number | null;
  currentPharmacyName?: string;
  deliveryArea?: string;
  onAssign: (orderId: number, pharmacyId: number, pharmacyName: string) => void;
  loading: boolean;
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
          className="w-40 h-8 justify-between items-center"
          size="sm"
          disabled={loading}
        >
          <span className="truncate">
            {loading ? "Assigning..." : currentPharmacyName || "Unassigned"}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
