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
    <div className="grid gap-8 lg:grid-cols-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out">
      
      {/* 1. Status Hero (Centered & Polished) */}
      <div className="lg:col-span-12">
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-12 flex flex-col items-center text-center relative overflow-hidden group">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary/5 via-primary/40 to-primary/5" />
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-primary/5 rounded-full blur-[100px] opacity-60" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-primary/5 rounded-full blur-[100px] opacity-60" />
          
          {/* Icon Section */}
          <div className="relative mb-10">
            <div className="h-32 w-32 rounded-full bg-slate-50 flex items-center justify-center relative z-10 transition-all duration-700 group-hover:scale-105">
              <div className="h-24 w-24 rounded-full bg-primary flex items-center justify-center shadow-2xl shadow-primary/40 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-transparent opacity-50" />
                {React.createElement(currentStatus.icon, { className: "h-12 w-12 text-white stroke-[2px] relative z-10" })}
              </div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 bg-primary/5 rounded-full animate-pulse" />
          </div>

          {/* Text Content */}
          <div className="max-w-2xl relative z-10">
            <div className="flex flex-col items-center gap-4 mb-6">
              <h2 className="text-5xl font-bold tracking-tight text-slate-900">{currentStatus.label}</h2>
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100/50">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">Live Status Updated</span>
              </div>
            </div>
            
            <p className="text-slate-500 font-medium text-xl leading-relaxed mb-10 max-w-lg mx-auto">
              {currentStatus.description}
            </p>

            {order.status !== 'completed' && (
              <div className="pt-8 border-t border-slate-100 w-full max-w-xs mx-auto flex flex-col items-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-3">
                  Estimated Arrival
                </p>
                <div className="flex items-center gap-3">
                   <Icon name="schedule" className="text-primary/60" opticalSize={20} />
                   <p className="text-3xl font-bold tracking-tight text-slate-800">
                    Today, <span className="text-primary">by {etaDisplay}</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* LEFT COLUMN: History & Details (Span 8) */}
      <div className="lg:col-span-8 space-y-8">
        {/* Tracking History */}
        <div className="bg-white rounded-[2rem] shadow-lg border-0 overflow-hidden">
          <div className="p-8 border-b border-[#f5f5f1]">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 flex items-center gap-2">
              <Icon name="assignment" className="text-muted-foreground/60" opticalSize={16} /> Tracking Timeline
            </h3>
          </div>
          
          <div className="p-8">
            <div className="relative border-l-2 border-[#f5f5f1] ml-4 space-y-12 pb-4">
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
                    <div key={index} className="relative pl-10 group">
                      {/* Dot */}
                      <div className={cn(
                        "absolute -left-[11px] top-1.5 h-5 w-5 rounded-full border-4 border-white shadow-sm transition-all duration-500",
                        isLatest ? "bg-primary scale-125 ring-8 ring-primary/5" : "bg-[#f5f5f1]"
                      )} />

                      <div className={cn(
                        "transition-all duration-500",
                        !isLatest && "opacity-50 group-hover:opacity-100"
                      )}>
                        <div className="flex justify-between items-start gap-4 mb-2">
                          <h4 className={cn(
                            "font-semibold tracking-tight text-xl leading-none",
                            isLatest ? "text-foreground" : "text-muted-foreground"
                          )}>
                            {getFriendlyEventTitle(event.status)}
                          </h4>
                          <time className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider whitespace-nowrap mt-1">
                            {new Date(event.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </time>
                        </div>
                        
                        <p className="text-[13px] font-bold text-muted-foreground/80 mb-3">
                          {new Date(event.date).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
                        </p>

                        {getReassuranceMessage(event.status) && (
                          <div className={cn(
                            "text-sm font-medium p-4 rounded-2xl border-0 max-w-lg",
                            isLatest ? "bg-primary/5 text-primary/80" : "bg-[#f5f5f1] text-muted-foreground"
                          )}>
                            {getReassuranceMessage(event.status)}
                          </div>
                        )}

                        {friendlyNote && (
                          <div className="mt-2 text-sm text-muted-foreground/80 bg-[#f5f5f1]/50 p-3 rounded-xl italic max-w-lg">
                            "{friendlyNote}"
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-[2rem] shadow-lg border-0 overflow-hidden">
          <div className="p-8 border-b border-[#f5f5f1]">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
              Package Contents
            </h3>
          </div>
          <div className="p-8 space-y-6">
            {order.items.map((item, i) => (
              <div key={i} className="flex gap-6 items-center">
                <div className="h-20 w-20 rounded-2xl bg-[#f5f5f1] flex items-center justify-center p-2 group relative">
                  {item.image_url ? (
                    <Image src={item.image_url} alt={item.name} fill className="object-contain p-3 transition-transform group-hover:scale-110" />
                  ) : (
                    <DiscreetBoxIcon className="h-10 w-10 text-primary/30" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold tracking-tight text-lg leading-tight mb-1">{item.name}</p>
                  <p className="text-sm font-bold text-muted-foreground/60">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold tracking-tight text-xl">GHS {item.price_ghs.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Summary & Delivery (Span 4) */}
      <div className="lg:col-span-4 space-y-8">
        {/* Payment Summary */}
        <div className="bg-[#f5f5f1] rounded-[2rem] shadow-sm p-8">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 mb-6">
            Order Total
          </h3>
          <div className="space-y-4 text-sm font-bold">
            <div className="flex justify-between text-muted-foreground/60">
              <span>Subtotal</span>
              <span>GHS {order.subtotal_ghs.toFixed(2)}</span>
            </div>
            {order.student_discount_ghs > 0 && (
              <div className="flex justify-between text-primary">
                <span>Student Discount</span>
                <span>- GHS {order.student_discount_ghs.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground/60">
              <span>Delivery Fee</span>
              <span>{order.delivery_fee_ghs === 0 ? "FREE" : `GHS ${order.delivery_fee_ghs.toFixed(2)}`}</span>
            </div>
            <div className="h-[1px] w-full bg-border/20 my-2" />
            <div className="flex justify-between items-baseline pt-2">
              <span className="text-muted-foreground uppercase text-[10px] tracking-widest">Total</span>
              <span className="text-3xl font-semibold tracking-tighter">GHS {order.total_price_ghs.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Delivery Details */}
        <div className="bg-white rounded-[2rem] shadow-lg p-8">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 mb-6 flex items-center gap-2">
            <Icon name="location_on" className="text-muted-foreground/60" opticalSize={16} /> Destination
          </h3>
          <div className="space-y-6">
            <div>
              <p className="font-semibold tracking-tight text-xl leading-tight mb-1">{order.deliveryArea}</p>
              <p className="text-sm font-medium text-muted-foreground">Main Delivery Area</p>
            </div>
            {order.deliveryAddressNote && (
              <div className="bg-[#f5f5f1] p-4 rounded-2xl italic text-sm text-muted-foreground font-medium">
                "{order.deliveryAddressNote}"
              </div>
            )}
          </div>
        </div>

        {/* Support CTA */}
        <Link href="https://wa.me/DISCREETKIT" target="_blank" className="block">
          <div className="bg-primary hover:bg-primary/95 text-white rounded-[2rem] p-8 shadow-lg shadow-primary/20 transition-all active:scale-[0.98] group">
            <div className="flex items-center gap-6">
              <div className="h-14 w-14 rounded-full bg-white/10 flex items-center justify-center transition-transform group-hover:rotate-12">
                <Icon name="chat" className="text-white" opticalSize={28} />
              </div>
              <div>
                <h4 className="font-semibold tracking-tight text-xl">Need Help?</h4>
                <p className="text-white/60 font-medium text-sm leading-snug">Tap to chat with us <br/>on WhatsApp 24/7.</p>
              </div>
            </div>
          </div>
        </Link>
        {/* 6. Dispatch Info (New) */}
        {order.courierName && (
          <div className="bg-primary/5 rounded-[2rem] shadow-sm border border-primary/10 p-8">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80 mb-6 flex items-center gap-2">
              <Icon name="local_shipping" className="text-primary/60" opticalSize={16} /> Dispatch Rider
            </h3>
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1 text-primary">Rider Name</p>
                <p className="font-semibold tracking-tight text-xl leading-tight text-primary">
                  {order.courierName}
                </p>
              </div>
              {order.courierPhone && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1 text-primary">Contact</p>
                  <p className="font-mono font-bold tracking-widest text-lg text-primary">
                    {order.courierPhone}
                  </p>
                </div>
              )}
              {order.courierTrackingUrl && (
                <div className="pt-4">
                  <a href={order.courierTrackingUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full h-12 rounded-xl font-bold bg-white gap-2 text-primary hover:bg-primary/5 border-primary/20 shadow-sm">
                      <Icon name="location_on" opticalSize={18} /> Track Live Location
                    </Button>
                  </a>
                </div>
              )}
            </div>
          </div>
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
        return "bg-[#f5f5f1] text-muted-foreground border-border/20";
    }
  };

  const daysUntilNextDelivery = subscription.nextDeliveryDate
    ? Math.ceil(
        (new Date(subscription.nextDeliveryDate).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24),
      )
    : null;

  return (
    <div className="grid gap-8 lg:grid-cols-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* LEFT COLUMN: Status & Details */}
      <div className="lg:col-span-8 space-y-8">
        {/* Subscription Status Card */}
        <div className="bg-white rounded-[2rem] shadow-lg border-0 overflow-hidden">
          <div className="p-8 border-b border-[#f5f5f1] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 flex items-center gap-2">
              <Icon name="medication" className="text-muted-foreground/60" opticalSize={16} /> Subscription Status
            </h3>
            <Badge
              className={cn(
                "text-xs px-4 py-1.5 font-bold uppercase tracking-widest rounded-full border-0",
                getStatusColor(subscription.status),
              )}
            >
              {subscription.status}
            </Badge>
          </div>
          <div className="p-8 space-y-8">
            <div className="flex items-center gap-6">
              <div className="h-24 w-24 rounded-[2rem] bg-[#f5f5f1] flex items-center justify-center p-3 relative group">
                {subscription.product?.image_url ? (
                  <Image
                    src={subscription.product.image_url}
                    alt={subscription.product.name}
                    fill
                    className="object-contain p-4 transition-transform group-hover:scale-110"
                  />
                ) : (
                  <Icon name="medication" className="text-muted-foreground/20" opticalSize={40} />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold tracking-tight text-2xl mb-1 mt-2">
                  {subscription.product?.name || "Medication"}
                </h3>
                <p className="font-bold text-muted-foreground/80">
                  {subscription.frequency === "monthly"
                    ? "Monthly"
                    : "Quarterly"}{" "}
                  Refill Service
                </p>
                <p className="text-[11px] font-bold text-muted-foreground/50 uppercase tracking-widest mt-2">
                  Enrolled {new Date(subscription.enrolledAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {daysUntilNextDelivery !== null && subscription.status === "active" && (
              <div className="mt-8 p-6 bg-primary/5 text-primary/80 rounded-[2rem] border-0 flex items-center gap-6">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon name="calendar_today" className="text-primary" opticalSize={24} />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest opacity-80 mb-1">Next Delivery</p>
                  <p className="text-3xl font-semibold tracking-tighter text-primary leading-none">
                    {daysUntilNextDelivery > 0
                      ? `In ${daysUntilNextDelivery} day${daysUntilNextDelivery !== 1 ? "s" : ""}`
                      : "Today"}
                  </p>
                  <p className="text-sm font-bold opacity-80 mt-2">
                    {new Date(subscription.nextDeliveryDate).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Refill History */}
        {subscription.refillHistory && subscription.refillHistory.length > 0 && (
          <div className="bg-white rounded-[2rem] shadow-lg border-0 overflow-hidden">
            <div className="p-8 border-b border-[#f5f5f1]">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 flex items-center gap-2">
                <Icon name="assignment" className="text-muted-foreground/60" opticalSize={16} /> Refill History
              </h3>
            </div>
            
            <div className="p-8">
              <div className="relative border-l-2 border-[#f5f5f1] ml-4 space-y-12 pb-4">
                {subscription.refillHistory.map((refill: any, index: number) => {
                  const isLatest = index === 0;
                  return (
                    <div key={index} className="relative pl-10 group">
                      {/* Dot */}
                      <div className={cn(
                        "absolute -left-[11px] top-1.5 h-5 w-5 rounded-full border-4 border-white shadow-sm transition-all duration-500",
                        isLatest ? "bg-primary scale-125 ring-8 ring-primary/5" : "bg-[#f5f5f1]"
                      )} />

                      <div className={cn(
                        "transition-all duration-500",
                        !isLatest && "opacity-50 group-hover:opacity-100"
                      )}>
                        <div className="flex justify-between items-start gap-4 mb-2">
                          <h4 className={cn(
                            "font-semibold tracking-tight text-xl leading-none",
                            isLatest ? "text-foreground" : "text-muted-foreground"
                          )}>
                            Refill Dispensed
                          </h4>
                          <time className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider whitespace-nowrap mt-1">
                            {new Date(refill.dispensed_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </time>
                        </div>
                        
                        <p className="text-[13px] font-bold text-muted-foreground/80 mb-3">
                          {new Date(refill.dispensed_at).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
                        </p>

                        {refill.notes && (
                          <div className={cn(
                            "text-sm font-medium p-4 rounded-2xl border-0 max-w-lg",
                            isLatest ? "bg-primary/5 text-primary/80 italic" : "bg-[#f5f5f1] text-muted-foreground italic"
                          )}>
                            "{refill.notes}"
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Details */}
      <div className="lg:col-span-4 space-y-8">
        {/* Prescription Status */}
        <div className="bg-white rounded-[2rem] shadow-lg p-8">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 mb-6 flex items-center gap-2">
            {subscription.prescriptionVerified ? (
              <Icon name="check_circle" className="text-green-600" opticalSize={16} fill={true} />
            ) : (
              <Icon name="schedule" className="text-yellow-600" opticalSize={16} />
            )}
            Prescription
          </h3>
          <div>
            <Badge
              className={cn(
                "text-xs px-4 py-1.5 font-bold uppercase tracking-widest rounded-full border-0 mb-4",
                subscription.prescriptionVerified
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700",
              )}
            >
              {subscription.prescriptionVerified ? "Verified" : "Pending Verif"}
            </Badge>
            {!subscription.prescriptionVerified ? (
              <p className="text-sm font-medium text-muted-foreground">
                Our pharmacists are reviewing your document.
              </p>
            ) : (
              <p className="text-sm font-medium text-muted-foreground">
                Valid prescription on file.
              </p>
            )}
          </div>
        </div>

        {/* MASKED Delivery Details */}
        <div className="bg-[#f5f5f1] rounded-[2rem] shadow-sm p-8">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-6 flex items-center gap-2">
            <Icon name="location_on" className="text-muted-foreground/60" opticalSize={16} /> Delivery
          </h3>
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">Masked Location</p>
              <p className="font-semibold tracking-tight text-xl leading-tight">
                {subscription.deliveryAddress?.city}
              </p>
              {subscription.deliveryAddress?.street && (
                <p className="text-sm font-bold text-muted-foreground/80 mt-1">
                  {subscription.deliveryAddress.street}
                </p>
              )}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">Masked Phone</p>
              <p className="font-mono font-bold tracking-widest text-lg">
                {subscription.deliveryAddress?.phone || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Assigned Pharmacy */}
        {subscription.pharmacy && (
          <div className="bg-white rounded-[2rem] shadow-lg p-8">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 mb-6 flex items-center gap-2">
              <Icon name="location_on" opticalSize={14} /> Pharmacy
            </h3>
            <div className="space-y-6">
              <div>
                <p className="font-semibold tracking-tight text-xl leading-tight mb-2">
                  {subscription.pharmacy.name}
                </p>
                {subscription.pharmacy.phone && (
                  <div>
                     <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 mb-1">Contact</p>
                     <p className="font-mono font-bold tracking-widest text-lg">
                      {subscription.pharmacy.phone}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Support CTA */}
        <Link href="https://wa.me/DISCREETKIT" target="_blank" className="block">
          <div className="bg-primary hover:bg-primary/95 text-white rounded-[2rem] p-8 shadow-lg shadow-primary/20 transition-all active:scale-[0.98] group">
            <div className="flex items-center gap-6">
              <div className="h-14 w-14 rounded-full bg-white/10 flex items-center justify-center transition-transform group-hover:rotate-12">
                <Icon name="chat" className="text-white" opticalSize={28} />
              </div>
              <div>
                <h4 className="font-semibold tracking-tight text-xl">Need Help?</h4>
                <p className="text-white/60 font-medium text-sm leading-snug">Tap to chat with us <br/>on WhatsApp 24/7.</p>
              </div>
            </div>
          </div>
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

