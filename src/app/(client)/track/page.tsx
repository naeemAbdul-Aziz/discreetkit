"use client";

import React, { useState, useEffect, useTransition, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getOrderAction, getSubscriptionAction } from "@/lib/actions";
import { type Order } from "@/lib/data";
import type { OrderStatus } from "@/lib/data";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  Package,
  Search,
  Truck,
  Server,
  PackageCheck,
  CreditCard,
  MapPin,
  ClipboardList,
  MessageSquare,
  Calendar,
  CheckCircle2,
  Clock,
  Pill,
} from "lucide-react";
import { BrandSpinner } from "@/components/brand-spinner";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { getSupabaseClient } from "@/lib/supabase";
import Image from "next/image";

export const dynamic = "force-dynamic";

const statusMap: Record<
  OrderStatus,
  { icon: React.ElementType; label: string; description: string }
> = {
  pending_payment: {
    icon: CreditCard,
    label: "Pending Payment",
    description: "Awaiting payment confirmation.",
  },
  received: {
    icon: Package,
    label: "Order Received",
    description: "We have your order and are preparing it.",
  },
  processing: {
    icon: Server,
    label: "Processing",
    description: "Your order is being processed at our facility.",
  },
  out_for_delivery: {
    icon: Truck,
    label: "Out for Delivery",
    description: "Your package is on its way to you.",
  },
  completed: {
    icon: PackageCheck,
    label: "Delivered",
    description: "Your order has been successfully delivered.",
  },
};

const getFriendlyEventTitle = (raw: string) => {
  const map: Record<string, string> = {
    order_created: "Order Placed",
    payment_pending: "Payment Pending",
    payment_confirmed: "Payment Confirmed",
    processing: "Processing Started",
    packed: "Order Packed",
    dispatch_assigned: "Rider Assigned",
    out_for_delivery: "Out for Delivery",
    completed: "Package Delivered",
    cancelled: "Order Cancelled",
  };
  return (
    map[raw] ||
    raw
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
  );
};

const getFriendlyNote = (note: string | null): string | null => {
  if (!note) return null;

  // Hide technical/debug messages
  const blocklist = [
    "Auto-assignment failed",
    "Pending manual assignment",
    "Logic:",
    "pharmacy #",
    "covers area but",
    "No pharmacy covers",
  ];

  if (blocklist.some((term) => note.includes(term))) {
    return null;
  }

  return note;
};

const allStatuses: OrderStatus[] = [
  "received",
  "processing",
  "out_for_delivery",
  "completed",
];

function Tracker() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState(searchParams.get("code") || "");
  const [trackingData, setTrackingData] = useState<
    { type: "order"; data: Order } | { type: "subscription"; data: any } | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!code) return;
    setError(null);
    setTrackingData(null);

    startTransition(async () => {
      const trimmedCode = code.trim().toUpperCase();

      // Detect code type: subscription codes start with "DK-SUB-"
      const isSubscription = trimmedCode.startsWith("DK-SUB-");

      if (isSubscription) {
        const result = await getSubscriptionAction(trimmedCode);
        if (result) {
          setTrackingData({ type: "subscription", data: result });
        } else {
          setError("Invalid subscription code. Please check and try again.");
        }
      } else {
        const result = await getOrderAction(trimmedCode);
        if (result) {
          setTrackingData({ type: "order", data: result });
        } else {
          setError("Invalid tracking code. Please check and try again.");
        }
      }
    });
  };

  useEffect(() => {
    if (searchParams.get("code")) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set up Supabase real-time subscription
  useEffect(() => {
    if (!trackingData) return;

    const supabase = getSupabaseClient();

    // Only set up real-time for orders (subscriptions update less frequently)
    if (trackingData.type === "order") {
      const channel = supabase
        .channel(`orders:id=eq.${trackingData.data.id}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "orders",
            filter: `id=eq.${trackingData.data.id}`,
          },
          (payload: any) => {
            // When an update is received, re-fetch the order data to get events
            startTransition(async () => {
              const result = await getOrderAction(trackingData.data.code);
              if (result) {
                setTrackingData({ type: "order", data: result });
              }
            });
          },
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [trackingData]);

  const order = trackingData?.type === "order" ? trackingData.data : null;
  const subscription =
    trackingData?.type === "subscription" ? trackingData.data : null;

  const currentStatusIndex = order ? allStatuses.indexOf(order.status) : -1;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Search Card */}
      <Card className="rounded-3xl border-muted shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/40 pb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">
                Track Your Order
              </CardTitle>
              <CardDescription className="mt-1">
                Real-time updates on your DiscreetKit delivery.
              </CardDescription>
            </div>
            <form
              onSubmit={handleSearch}
              className="flex w-full max-w-sm items-center gap-2"
            >
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter Tracking Code (e.g., A9K...)"
                className="bg-background shadow-sm"
                disabled={isPending}
                aria-label="Tracking Code"
              />
              <Button type="submit" disabled={isPending || !code}>
                {isPending ? <BrandSpinner size="sm" /> : <>Track</>}
              </Button>
            </form>
          </div>
        </CardHeader>
      </Card>

      {error && (
        <Alert variant="destructive" className="rounded-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Not Found</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isPending && !trackingData && (
        <div className="py-12 flex flex-col items-center justify-center text-muted-foreground animate-pulse">
          <BrandSpinner size="lg" />
          <p className="mt-4 text-sm font-medium">Searching our records...</p>
        </div>
      )}

      {/* Render Order Tracking */}
      {order && <OrderTrackingView order={order} />}

      {/* Render Subscription Tracking */}
      {subscription && <SubscriptionTrackingView subscription={subscription} />}
    </div>
  );
}

// Order Tracking Component (existing UI)
function OrderTrackingView({ order }: { order: Order }) {
  const allStatuses: OrderStatus[] = [
    "received",
    "processing",
    "out_for_delivery",
    "completed",
  ];
  const currentStatusIndex = allStatuses.indexOf(order.status);

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* LEFT COLUMN: Status & Items (Span 2) */}
      <div className="md:col-span-2 space-y-6">
        {/* 2. Vertical Timeline (The Hero) */}
        <Card className="rounded-3xl border-muted shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 pb-6">
            <CardTitle className="flex items-center gap-2 text-xl">
              <ClipboardList className="h-5 w-5 text-primary" /> Tracking
              History
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8 pl-6">
            <div className="relative border-l-2 border-primary/10 ml-3 space-y-12 pb-4">
              {[...order.events]
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime(),
                ) // Newest first
                .map((event, index) => {
                  const isLatest = index === 0;
                  const friendlyNote = getFriendlyNote(event.note);

                  return (
                    <div key={index} className="relative pl-8 group">
                      {/* Dot */}
                      <div
                        className={cn(
                          "absolute -left-[9px] top-1 h-4 w-4 rounded-full border-4 border-background transition-all duration-500",
                          isLatest
                            ? "bg-primary ring-4 ring-primary/10 shadow-lg scale-110"
                            : "bg-muted-foreground/20 group-hover:bg-muted-foreground/40",
                        )}
                      />

                      <div
                        className={cn(
                          "flex flex-col gap-1 transition-all duration-500",
                          !isLatest && "opacity-70 group-hover:opacity-100",
                        )}
                      >
                        <h4
                          className={cn(
                            "font-bold text-lg tracking-tight",
                            isLatest ? "text-primary" : "text-foreground",
                          )}
                        >
                          {getFriendlyEventTitle(event.status)}
                        </h4>

                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
                          {new Date(event.date).toLocaleDateString(undefined, {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          at{" "}
                          {new Date(event.date).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>

                        {friendlyNote && (
                          <div className="mt-2 text-sm text-foreground/80 bg-muted/30 p-3 rounded-r-xl rounded-bl-xl border border-muted/50 max-w-md animate-in fade-in slide-in-from-top-1 duration-500">
                            {friendlyNote}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        {/* 2. Order Items */}
        <Card className="rounded-3xl border-muted shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Items Ordered</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.items.map((item, i) => (
              <div key={item.id + i} className="flex gap-3 items-start">
                {/* Image */}
                <div className="relative h-12 w-12 flex-shrink-0 rounded-lg bg-muted border overflow-hidden">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      className="object-contain p-1"
                    />
                  ) : (
                    <Package className="h-full w-full p-3 text-muted-foreground/30" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground leading-snug line-clamp-2">
                    {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Qty: {item.quantity}
                  </p>
                </div>

                {/* Price */}
                <div className="text-right">
                  <p className="font-semibold text-sm whitespace-nowrap">
                    <span className="text-[10px] text-muted-foreground font-normal mr-1">
                      GHS
                    </span>
                    {item.price_ghs.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* RIGHT COLUMN: Summary & History (Span 1) */}
      <div className="space-y-6">
        {/* 3. Summary & Payment */}
        <Card className="rounded-3xl border-muted shadow-sm bg-muted/20">
          <CardHeader>
            <CardTitle className="text-lg">Payment Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>GHS {order.subtotal.toFixed(2)}</span>
            </div>
            {order.studentDiscount > 0 && (
              <div className="flex justify-between text-success font-medium">
                <span>Student Discount</span>
                <span>- GHS {order.studentDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span>Delivery Fee</span>
              <span>
                {order.deliveryFee === 0
                  ? "Free"
                  : `GHS ${order.deliveryFee.toFixed(2)}`}
              </span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between items-baseline">
              <span className="font-bold text-lg">Total</span>
              <span className="font-bold text-lg">
                GHS {order.totalPrice.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 4. Delivery Details */}
        <Card className="rounded-3xl border-muted shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> Delivery Details
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Location
              </p>
              <p className="font-medium">{order.deliveryArea}</p>
            </div>
            {order.deliveryAddressNote && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  Note
                </p>
                <p className="italic text-muted-foreground">
                  "{order.deliveryAddressNote}"
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 5. Helpful Links (Replaced old timeline) */}
        <Card className="rounded-3xl border-muted shadow-sm overflow-hidden bg-primary text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-lg">Need Help?</h4>
                <p className="text-sm text-white/80">
                  Support is available 24/7 on WhatsApp.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 6. Dispatch Info (New) */}
        {order.courierName && (
          <Card className="rounded-3xl border-primary/20 shadow-sm bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-primary">
                <Truck className="h-4 w-4" /> Dispatch Rider
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  Rider Name
                </p>
                <p className="font-medium text-lg">{order.courierName}</p>
              </div>
              {order.courierPhone && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    Contact
                  </p>
                  <p className="font-medium font-mono">{order.courierPhone}</p>
                </div>
              )}
              {order.courierTrackingUrl && (
                <div className="pt-2">
                  <a
                    href={order.courierTrackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                    >
                      <MapPin className="h-3 w-3" /> Track Live Location
                    </Button>
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Subscription Tracking Component
function SubscriptionTrackingView({ subscription }: { subscription: any }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700 border-green-200";
      case "paused":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const daysUntilNextDelivery = subscription.nextDeliveryDate
    ? Math.ceil(
        (new Date(subscription.nextDeliveryDate).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24),
      )
    : null;

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* LEFT COLUMN: Status & Details */}
      <div className="md:col-span-2 space-y-6">
        {/* Subscription Status Card */}
        <Card className="rounded-3xl border-muted shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 pb-6">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Pill className="h-5 w-5 text-primary" /> Subscription Status
              </CardTitle>
              <Badge
                className={cn(
                  "text-sm px-3 py-1",
                  getStatusColor(subscription.status),
                )}
              >
                {subscription.status.charAt(0).toUpperCase() +
                  subscription.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="relative h-20 w-20 flex-shrink-0 rounded-lg bg-muted border overflow-hidden">
                {subscription.product?.image_url ? (
                  <Image
                    src={subscription.product.image_url}
                    alt={subscription.product.name}
                    fill
                    className="object-contain p-2"
                  />
                ) : (
                  <Pill className="h-full w-full p-4 text-muted-foreground/30" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">
                  {subscription.product?.name || "Medication"}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {subscription.frequency === "monthly"
                    ? "Monthly"
                    : "Quarterly"}{" "}
                  Refill Service
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Enrolled on{" "}
                  {new Date(subscription.enrolledAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {daysUntilNextDelivery !== null &&
              subscription.status === "active" && (
                <div className="mt-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Next Delivery</p>
                      <p className="text-lg font-bold text-primary">
                        {daysUntilNextDelivery > 0
                          ? `In ${daysUntilNextDelivery} day${daysUntilNextDelivery !== 1 ? "s" : ""}`
                          : "Today"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(
                          subscription.nextDeliveryDate,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
          </CardContent>
        </Card>

        {/* Refill History */}
        {subscription.refillHistory &&
          subscription.refillHistory.length > 0 && (
            <Card className="rounded-3xl border-muted shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/30 pb-6">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <ClipboardList className="h-5 w-5 text-primary" /> Refill
                  History
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 pl-6">
                <div className="relative border-l-2 border-primary/10 ml-3 space-y-8 pb-4">
                  {subscription.refillHistory.map(
                    (refill: any, index: number) => (
                      <div key={index} className="relative pl-8">
                        <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-4 border-background bg-primary" />
                        <div className="flex flex-col gap-1">
                          <h4 className="font-bold text-lg">
                            Refill Dispensed
                          </h4>
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                            {new Date(refill.dispensed_at).toLocaleDateString(
                              undefined,
                              {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              },
                            )}{" "}
                            at{" "}
                            {new Date(refill.dispensed_at).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                          {refill.notes && (
                            <div className="mt-2 text-sm text-foreground/80 bg-muted/30 p-3 rounded-r-xl rounded-bl-xl border border-muted/50 max-w-md">
                              {refill.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
          )}
      </div>

      {/* RIGHT COLUMN: Details */}

      <div className="space-y-6">
        {/* Prescription Status */}
        <Card className="rounded-3xl border-muted shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              {subscription.prescriptionVerified ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <Clock className="h-4 w-4 text-yellow-600" />
              )}
              Prescription Status
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <Badge
              className={cn(
                "text-sm px-3 py-1",
                subscription.prescriptionVerified
                  ? "bg-green-100 text-green-700 hover:bg-green-100"
                  : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
              )}
            >
              {subscription.prescriptionVerified
                ? "Verified"
                : "Pending Verification"}
            </Badge>
            {!subscription.prescriptionVerified && (
              <p className="text-xs text-muted-foreground mt-2">
                Our pharmacists are reviewing your document.
              </p>
            )}
          </CardContent>
        </Card>

        {/* MASKED Delivery Details */}
        <Card className="rounded-3xl border-muted shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> Delivery Info
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Location (Masked)
              </p>
              <p className="font-medium">
                {subscription.deliveryAddress?.city}
                {subscription.deliveryAddress?.street && (
                  <span className="block text-muted-foreground text-xs">
                    {subscription.deliveryAddress.street}
                  </span>
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Phone (Masked)
              </p>
              <p className="font-mono">
                {subscription.deliveryAddress?.phone || "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Assigned Pharmacy */}
        {subscription.pharmacy && (
          <Card className="rounded-3xl border-muted shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> Assigned Pharmacy
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <div>
                <p className="font-medium text-lg">
                  {subscription.pharmacy.name}
                </p>
              </div>
              {subscription.pharmacy.phone && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    Contact
                  </p>
                  <p className="font-medium font-mono">
                    {subscription.pharmacy.phone}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card className="rounded-3xl border-muted shadow-sm overflow-hidden bg-primary text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-lg">Need Help?</h4>
                <p className="text-sm text-white/80">
                  Support is available 24/7 on WhatsApp.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TrackPageLoading() {
  return (
    <div className="flex h-64 items-center justify-center">
      <BrandSpinner size="lg" />
    </div>
  );
}

export default function TrackPage() {
  return (
    <div className="bg-muted">
      <div className="container mx-auto flex min-h-[calc(100dvh-10rem)] justify-center px-4 py-12 md:px-6 md:py-24">
        <Suspense fallback={<TrackPageLoading />}>
          <Tracker />
        </Suspense>
      </div>
    </div>
  );
}
