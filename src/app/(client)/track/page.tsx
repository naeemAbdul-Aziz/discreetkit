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
import { Icon } from "@/components/ui/icon";
import { BrandSpinner } from "@/components/brand-spinner";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { getSupabaseClient } from "@/lib/supabase";
import Image from "next/image";
import { DiscreetBoxIcon } from "@/components/icons/discreet-box-icon";
import Link from "next/link";

import { LifestylePaymentIcon } from "@/components/icons/lifestyle-payment-icon";
import { LifestyleCourierIcon } from "@/components/icons/lifestyle-courier-icon";
import { LifestyleWellnessIcon } from "@/components/icons/lifestyle-wellness-icon";
import { LifestylePrivacyIcon } from "@/components/icons/lifestyle-privacy-icon";

export const dynamic = "force-dynamic";

const statusMap: Record<
  OrderStatus,
  { icon: React.ElementType; label: string; description: string }
> = {
  pending_payment: {
    icon: LifestylePaymentIcon,
    label: "Confirming Payment",
    description: "We're verifying your payment securely.",
  },
  received: {
    icon: DiscreetBoxIcon,
    label: "Order Confirmed",
    description: "Your order is confirmed and in safe hands.",
  },
  processing: {
    icon: LifestyleWellnessIcon,
    label: "Being Prepared",
    description: "We're carefully packing your order with care.",
  },
  out_for_delivery: {
    icon: LifestyleCourierIcon,
    label: "On the Way",
    description: "A trusted rider is bringing your package to you.",
  },
  completed: {
    icon: LifestylePrivacyIcon,
    label: "Delivered",
    description: "Delivered safely and discreetly. Thank you!",
  },
};

const getFriendlyEventTitle = (raw: string) => {
  const map: Record<string, string> = {
    order_created: "Order Received",
    payment_pending: "Confirming Payment",
    payment_confirmed: "Payment Confirmed",
    processing: "Preparing Your Order",
    packed: "Packed & Ready",
    dispatch_assigned: "On the Way",
    out_for_delivery: "Out for Delivery",
    completed: "Delivered",
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

const getReassuranceMessage = (status: string): string | null => {
  const normalized = status.toLowerCase().replace(/\s+/g, "_");

  const messages: Record<string, string> = {
    order_received: "We've got your order! Our team is on it.",
    order_created: "We've got your order! Our team is on it.",
    payment_pending: "Verifying your payment securely.",
    payment_confirmed: "Payment received. Your order is confirmed!",
    processing: "We're carefully preparing your package with discretion.",
    packed: "All set! Your order is packed and ready to go.",
    dispatch_assigned: "A trusted rider is heading your way.",
    out_for_delivery: "Almost there! Your package is on the way.",
    completed: "Delivered safely. Thank you for trusting us!",
  };

  return messages[normalized] || messages[status] || null;
};

const getFriendlyNote = (note: string | null): string | null => {
  if (!note) return null;

  // Hide technical/debug messages - expanded blocklist
  const blocklist = [
    "Auto-assignment failed",
    "Pending manual assignment",
    "Logic:",
    "pharmacy #",
    "covers area but",
    "No pharmacy covers",
    "Pharmacy acknowledge:",
    "Notifications sent",
    "acknowledge:",
    "declined -",
    "needs reassignment",
    "Email notification",
    "failed:",
    "Error:",
    "Exception:",
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
  }, [searchParams]);

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
          () => {
            // When an update is received, re-fetch the order data to get events
            startTransition(async () => {
              const result = await getOrderAction((trackingData.data as Order).code);
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

  return (
    <div className={cn(
      "w-full mx-auto transition-all duration-1000 ease-in-out flex flex-col items-center",
      trackingData ? "max-w-6xl" : "max-w-xl pt-[8dvh]"
    )}>
      {/* Search Hub */}
      <div className={cn(
        "w-full text-center transition-all duration-700 flex flex-col items-center",
        trackingData ? "mb-12" : "mb-0"
      )}>
        <div className={cn(
          "transition-all duration-700",
          trackingData ? "mb-8" : "mb-12"
        )}>
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-3xl bg-primary/5 mb-6 animate-in zoom-in duration-1000">
             <Icon name="location_searching" className="text-primary" opticalSize={32} />
          </div>
          <h1 className={cn(
            "font-bold tracking-tight mb-4 text-slate-900 transition-all duration-700",
            trackingData ? "text-3xl" : "text-6xl"
          )}>
            {trackingData ? "Order Status" : "Track Order"}
          </h1>
          <p className={cn(
            "text-slate-500 font-medium transition-all duration-700",
            trackingData ? "text-base" : "text-xl max-w-md mx-auto leading-relaxed"
          )}>
            {trackingData 
              ? "Real-time delivery updates for your package." 
              : "Enter your unique tracking code below to see the status of your discreet delivery."}
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          className={cn(
            "flex items-center gap-3 p-3 transition-all duration-700 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] w-full",
            trackingData 
              ? "max-w-md bg-white rounded-full border border-slate-100" 
              : "max-w-lg bg-white rounded-[2.5rem] md:p-4 border border-slate-100"
          )}
        >
          <div className="relative flex-1">
            <Icon name="search" className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" opticalSize={20} />
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Order Code (e.g. A9K...)"
              className="w-full h-14 pl-14 pr-4 bg-slate-50/50 border-0 rounded-full text-base font-bold tracking-wide placeholder:font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-primary/10 outline-none transition-all"
              disabled={isPending}
            />
          </div>
          <Button 
            type="submit" 
            disabled={isPending || !code}
            className="h-14 px-10 rounded-full font-bold shadow-xl transition-all active:scale-95 bg-primary hover:bg-primary/95 text-white"
          >
            {isPending ? <BrandSpinner size="sm" /> : "Track"}
          </Button>
        </form>
      </div>

      {error && (
        <div className="mx-auto max-w-md mb-12">
          <Alert variant="destructive" className="rounded-[2rem] border-0 shadow-xl bg-red-50/50 text-red-900 p-6">
            <div className="flex items-center gap-4">
               <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <Icon name="error" className="text-red-600" opticalSize={20} fill={true} />
               </div>
               <div>
                  <AlertTitle className="font-bold text-lg">Order Not Found</AlertTitle>
                  <AlertDescription className="font-medium opacity-70 leading-tight">{error}</AlertDescription>
               </div>
            </div>
          </Alert>
        </div>
      )}

      {isPending && !trackingData && (
        <div className="py-24 w-full flex flex-col items-center justify-center text-slate-400 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="relative mb-10">
            <div className="h-24 w-24 rounded-full border-[4px] border-slate-100 border-t-primary animate-spin shadow-inner" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
               <Icon name="search" className="text-primary/40" opticalSize={32} />
            </div>
          </div>
          <h3 className="font-bold tracking-tight text-3xl text-slate-900 mb-3">Authenticating Code</h3>
          <p className="text-base font-medium opacity-60 max-w-xs text-center leading-relaxed">
            Please wait while we securely retrieve your private delivery status.
          </p>
        </div>
      )}

      {/* Render Order Tracking */}
      {trackingData?.type === "order" && <OrderTrackingView order={trackingData.data as Order} />}

      {/* Render Subscription Tracking */}
      {trackingData?.type === "subscription" && <SubscriptionTrackingView subscription={trackingData.data} />}
    </div>
  );
}

function OrderTrackingView({ order }: { order: Order }) {
  const latestEvent = [...order.events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  const currentStatus = statusMap[order.status] || statusMap['received'];

  const calculateETA = () => {
    if (order.status === 'completed') return "Delivered";
    if (!latestEvent) return "Today, by 6:00 PM";
    const baseDate = new Date(latestEvent.date);
    const etaDate = new Date(baseDate.getTime() + 2 * 60 * 60 * 1000);
    const now = new Date();
    const finalDate = etaDate < now ? new Date(now.getTime() + 60 * 60 * 1000) : etaDate;
    return finalDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const etaDisplay = calculateETA();

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-[2rem] border border-slate-100 shadow-[0_12px_40px_rgba(0,0,0,0.02)] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out">
      
      {/* Header Info Block */}
      <div className="p-8 pb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Order #{order.code}</h2>
            <p className="text-xs font-bold text-slate-400 mt-1">
              {new Date(latestEvent ? latestEvent.date : new Date()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <Badge className={cn(
              "text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border-0 shadow-none",
              order.status === 'completed' ? "bg-emerald-50 text-emerald-700" :
              order.status === 'out_for_delivery' ? "bg-amber-50 text-amber-700 animate-pulse" :
              order.status === 'processing' ? "bg-blue-50 text-blue-700" :
              "bg-slate-100 text-slate-700"
            )}>
              {currentStatus.label}
            </Badge>
            <span className="text-[11px] font-bold text-slate-500 tracking-tight">₵{order.total_price_ghs.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Order Summary Section Banner */}
      <div className="bg-slate-50/70 px-8 py-3 text-[10px] font-black uppercase tracking-wider text-slate-400 border-y border-slate-100">
        Order Summary
      </div>
      <div className="p-8 space-y-6">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between items-center gap-4 text-sm">
            <div className="flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-slate-50 flex items-center justify-center p-1.5 border border-slate-100/80 relative shrink-0">
                {item.image_url ? (
                  <Image src={item.image_url} alt={item.name} fill className="object-contain p-1" />
                ) : (
                  <DiscreetBoxIcon className="h-5 w-5 text-primary/30" />
                )}
              </div>
              <div>
                <p className="font-extrabold text-slate-800 tracking-tight leading-tight">{item.name}</p>
                <p className="text-[10px] font-bold text-slate-400 mt-1">Quantity: {item.quantity}</p>
              </div>
            </div>
            <p className="font-extrabold text-slate-900 tabular-nums">₵{(item.price_ghs * item.quantity).toFixed(2)}</p>
          </div>
        ))}
        
        <div className="border-t border-dashed border-slate-200/60 my-5" />

        <div className="space-y-2.5 text-xs font-bold text-slate-500">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="text-slate-700 tabular-nums">₵{order.subtotal_ghs.toFixed(2)}</span>
          </div>
          {order.student_discount_ghs > 0 && (
            <div className="flex justify-between text-brand-teal">
              <span>Student Discount</span>
              <span className="tabular-nums">-₵{order.student_discount_ghs.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Logistics Fee</span>
            <span className="text-slate-700 tabular-nums">{order.delivery_fee_ghs === 0 ? "FREE" : `₵${order.delivery_fee_ghs.toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between items-baseline pt-3 text-sm text-slate-900 font-extrabold border-t border-slate-50">
            <span>Total</span>
            <span className="text-xl text-slate-900 tabular-nums tracking-tight">₵{order.total_price_ghs.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Customer Section Banner */}
      <div className="bg-slate-50/70 px-8 py-3 text-[10px] font-black uppercase tracking-wider text-slate-400 border-y border-slate-100">
        Customer Info
      </div>
      <div className="p-8 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200/50 flex items-center justify-center font-extrabold text-slate-600 text-sm shrink-0">
          DP
        </div>
        <div>
          <p className="text-sm font-extrabold text-slate-800 tracking-tight leading-none">Discreet Patient</p>
          <p className="text-[11px] font-bold text-slate-400 mt-1.5">{order.deliveryArea || "Standard Delivery Zone"}</p>
        </div>
      </div>

      {/* Timeline Section Banner */}
      <div className="bg-slate-50/70 px-8 py-3 text-[10px] font-black uppercase tracking-wider text-slate-400 border-y border-slate-100">
        Timeline
      </div>
      <div className="p-8">
        <div className="relative border-l border-slate-100 ml-3.5 space-y-8 pb-2">
          {[...order.events]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .filter((event, i, self) => {
              const key = event.status.toLowerCase().trim();
              return i === self.findIndex((e) => e.status.toLowerCase().trim() === key);
            })
            .map((event, index) => {
              const isLatest = index === 0;
              const friendlyNote = getFriendlyNote(event.note);

              return (
                <div key={index} className="relative pl-8 group">
                  {/* Dot */}
                  <div className={cn(
                    "absolute -left-[6.5px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm transition-all duration-500",
                    isLatest ? "bg-brand-teal scale-110 ring-4 ring-brand-teal/10" : "bg-slate-200"
                  )} />

                  <div className={cn(
                    "transition-all duration-500",
                    !isLatest && "opacity-50 group-hover:opacity-100"
                  )}>
                    <div className="flex justify-between items-baseline gap-4 mb-1">
                      <h4 className={cn(
                        "font-extrabold text-sm tracking-tight leading-none",
                        isLatest ? "text-slate-900" : "text-slate-500"
                      )}>
                        {getFriendlyEventTitle(event.status)}
                      </h4>
                      <time className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                        {new Date(event.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </time>
                    </div>
                    
                    <p className="text-[11px] font-bold text-slate-400">
                      {new Date(event.date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                    </p>

                    {getReassuranceMessage(event.status) && (
                      <p className="text-xs font-medium text-slate-400 mt-1 leading-relaxed">
                        {getReassuranceMessage(event.status)}
                      </p>
                    )}

                    {friendlyNote && (
                      <p className="text-xs font-medium text-slate-500 italic mt-2 bg-slate-50/60 p-3 rounded-xl border border-slate-100/50">
                        &quot;{friendlyNote}&quot;
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Dispatch Rider Section Banner */}
      {order.courierName && (
        <>
          <div className="bg-slate-50/70 px-8 py-3 text-[10px] font-black uppercase tracking-wider text-slate-400 border-y border-slate-100">
            Dispatch Rider
          </div>
          <div className="p-8 space-y-4">
            <div className="flex justify-between items-center gap-4 flex-wrap">
              <div>
                <p className="font-extrabold text-slate-800 tracking-tight leading-tight">{order.courierName}</p>
                <p className="text-[11px] font-bold text-slate-400 mt-1">Phone: {order.courierPhone || "N/A"}</p>
              </div>
              {order.courierTrackingUrl && (
                <a href={order.courierTrackingUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="h-10 rounded-xl font-bold bg-white text-xs text-brand-teal border-brand-teal/20 hover:bg-brand-teal/5 gap-2">
                    <Icon name="location_on" opticalSize={16} /> Track Location
                  </Button>
                </a>
              )}
            </div>
          </div>
        </>
      )}

      {/* WhatsApp Help CTA Support Banner */}
      <div className="p-8 bg-slate-50 border-t border-slate-100 text-center">
        <p className="text-xs font-bold text-slate-400 mb-3.5">Need help with your delivery?</p>
        <Link 
          href="https://wa.me/233539384839" 
          target="_blank" 
          className="inline-flex items-center justify-center gap-2 px-6 h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-emerald-600/10 transition-all active:scale-[0.98]"
        >
          <Icon name="chat" className="text-white" opticalSize={16} /> Chat on WhatsApp
        </Link>
      </div>
    </div>
  );
}

// Subscription Tracking Component
function SubscriptionTrackingView({ subscription }: { subscription: any }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-50 text-green-700";
      case "paused":
        return "bg-yellow-50 text-yellow-700";
      case "cancelled":
        return "bg-red-50 text-red-700";
      default:
        return "bg-slate-50 text-slate-700";
    }
  };

  const daysUntilNextDelivery = subscription.nextDeliveryDate
    ? Math.ceil((new Date(subscription.nextDeliveryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-[2rem] border border-slate-100 shadow-[0_12px_40px_rgba(0,0,0,0.02)] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out">
      
      {/* Header Info Block */}
      <div className="p-8 pb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Subscription Status</h2>
            <p className="text-xs font-bold text-slate-400 mt-1">
              Refill service tracking
            </p>
          </div>
          <Badge className={cn(
            "text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border-0 shadow-none",
            getStatusColor(subscription.status)
          )}>
            {subscription.status}
          </Badge>
        </div>
      </div>

      {/* Subscription Details Section Banner */}
      <div className="bg-slate-50/70 px-8 py-3 text-[10px] font-black uppercase tracking-wider text-slate-400 border-y border-slate-100">
        Medication Details
      </div>
      <div className="p-8 space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-slate-50 flex items-center justify-center p-2 border border-slate-100/80 relative shrink-0">
            {subscription.product?.image_url ? (
              <Image src={subscription.product.image_url} alt={subscription.product.name} fill className="object-contain p-1" />
            ) : (
              <Icon name="medication" className="text-slate-300" opticalSize={24} />
            )}
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 tracking-tight leading-tight">
              {subscription.product?.name || "Medication"}
            </h3>
            <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
              {subscription.frequency === "monthly" ? "Monthly" : "Quarterly"} Refill
            </p>
          </div>
        </div>

        {daysUntilNextDelivery !== null && subscription.status === "active" && (
          <div className="p-5 bg-teal-50/50 text-teal-800 rounded-2xl border border-teal-100/50 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
              <Icon name="calendar_today" className="text-brand-teal" opticalSize={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-0.5">Next Delivery</p>
              <p className="text-lg font-extrabold tracking-tight text-teal-900">
                {daysUntilNextDelivery > 0 ? `In ${daysUntilNextDelivery} day${daysUntilNextDelivery !== 1 ? "s" : ""}` : "Today"}
              </p>
              <p className="text-[11px] font-bold opacity-75 mt-0.5">
                {new Date(subscription.nextDeliveryDate).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Prescription section */}
      <div className="bg-slate-50/70 px-8 py-3 text-[10px] font-black uppercase tracking-wider text-slate-400 border-y border-slate-100">
        Prescription Info
      </div>
      <div className="p-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="font-extrabold text-slate-800 tracking-tight leading-tight">
              {subscription.prescriptionVerified ? "Verified Prescription" : "Pending Verification"}
            </p>
            <p className="text-[11px] font-bold text-slate-400 mt-1">
              {subscription.prescriptionVerified ? "Valid prescription is active and on file." : "Our pharmacy team is currently reviewing your document."}
            </p>
          </div>
          <Badge className={cn(
            "text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border-0 shadow-none",
            subscription.prescriptionVerified ? "bg-emerald-50 text-emerald-700" : "bg-yellow-50 text-yellow-700"
          )}>
            {subscription.prescriptionVerified ? "Verified" : "Pending"}
          </Badge>
        </div>
      </div>

      {/* Delivery details section */}
      <div className="bg-slate-50/70 px-8 py-3 text-[10px] font-black uppercase tracking-wider text-slate-400 border-y border-slate-100">
        Delivery Destination
      </div>
      <div className="p-8 space-y-4">
        <div>
          <p className="font-extrabold text-slate-800 tracking-tight leading-tight">{subscription.deliveryAddress?.city || "Standard Zone"}</p>
          {subscription.deliveryAddress?.street && (
            <p className="text-[11px] font-bold text-slate-400 mt-1">{subscription.deliveryAddress.street}</p>
          )}
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-0.5">Masked Contact</p>
          <p className="font-mono font-bold tracking-widest text-sm text-slate-700">
            {subscription.deliveryAddress?.phone || "N/A"}
          </p>
        </div>
      </div>

      {/* Refill History Timeline */}
      {subscription.refillHistory && subscription.refillHistory.length > 0 && (
        <>
          <div className="bg-slate-50/70 px-8 py-3 text-[10px] font-black uppercase tracking-wider text-slate-400 border-y border-slate-100">
            Refill History
          </div>
          <div className="p-8">
            <div className="relative border-l border-slate-100 ml-3.5 space-y-8 pb-2">
              {subscription.refillHistory.map((refill: any, index: number) => {
                const isLatest = index === 0;
                return (
                  <div key={index} className="relative pl-8 group">
                    {/* Dot */}
                    <div className={cn(
                      "absolute -left-[6.5px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm transition-all duration-500",
                      isLatest ? "bg-brand-teal scale-110 ring-4 ring-brand-teal/10" : "bg-slate-200"
                    )} />

                    <div className={cn(
                      "transition-all duration-500",
                      !isLatest && "opacity-50 group-hover:opacity-100"
                    )}>
                      <div className="flex justify-between items-baseline gap-4 mb-1">
                        <h4 className={cn(
                          "font-extrabold text-sm tracking-tight leading-none",
                          isLatest ? "text-slate-900" : "text-slate-500"
                        )}>
                          Refill Dispensed
                        </h4>
                        <time className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                          {new Date(refill.dispensed_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </time>
                      </div>
                      
                      <p className="text-[11px] font-bold text-slate-400">
                        {new Date(refill.dispensed_at).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                      </p>

                      {refill.notes && (
                        <p className="text-xs font-medium text-slate-500 italic mt-2 bg-slate-50/60 p-3 rounded-xl border border-slate-100/50">
                          &quot;{refill.notes}&quot;
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* WhatsApp Help CTA Support Banner */}
      <div className="p-8 bg-slate-50 border-t border-slate-100 text-center">
        <p className="text-xs font-bold text-slate-400 mb-3.5">Need help with your subscription?</p>
        <Link 
          href="https://wa.me/233539384839" 
          target="_blank" 
          className="inline-flex items-center justify-center gap-2 px-6 h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-emerald-600/10 transition-all active:scale-[0.98]"
        >
          <Icon name="chat" className="text-white" opticalSize={16} /> Chat on WhatsApp
        </Link>
      </div>
    </div>
  );
}

function TrackPageLoading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center animate-in fade-in duration-700">
      <div className="relative mb-8">
        <div className="h-24 w-24 rounded-full border-[3px] border-slate-100 border-t-primary animate-spin" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
           <Icon name="search" className="text-primary/40" opticalSize={32} />
        </div>
      </div>
      <h3 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Fetching Order Data</h3>
      <p className="text-slate-400 font-medium">Securing your private tracking details...</p>
    </div>
  );
}

export default function TrackPage() {
  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8 md:py-24">
        <Suspense fallback={<TrackPageLoading />}>
          <Tracker />
        </Suspense>
      </div>
    </div>
  );
}

