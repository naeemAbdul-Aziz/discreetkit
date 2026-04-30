"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Package,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  Truck,
  ChevronLeft,
  GanttChartSquare,
  Clock,
  ArrowRight,
  Info,
  ShieldCheck,
  Terminal,
  Activity,
  Zap,
  Map,
  History,
  Repeat
} from "lucide-react";
import { OrderMessages } from "@/components/order-messages";
import { cn } from "@/lib/utils";

interface OrderDetailsSheetProps {
  order: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept?: () => void;
  onDecline?: () => void;
  onMarkOutForDelivery?: () => void;
  onMarkCompleted?: () => void;
  loading?: boolean;
  loadingAction?: string;
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
  loadingAction,
}: OrderDetailsSheetProps) {
  if (!order) return null;

  const items = typeof order.items === "string" ? JSON.parse(order.items) : order.items;
  const itemsArray = Array.isArray(items) ? items : [];

  const getStatusBadge = (status: string, ackStatus?: string) => {
    if (status === "processing" && ackStatus === "accepted") {
      return (
        <div className="flex items-center gap-3 px-5 py-2 rounded-full bg-brand-teal/10 text-brand-teal border border-brand-teal/20 shadow-sm">
          <Package className="h-4 w-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">STAGING_NODE</span>
        </div>
      );
    }
    const variants: any = {
      received: { label: "INBOUND_QUEUE", color: "bg-slate-50 text-slate-400" },
      processing: { label: "STAGING", color: "bg-brand-teal/10 text-brand-teal", icon: Package },
      out_for_delivery: { label: "TRANSIT", color: "bg-amber-50 text-amber-600", icon: Truck },
      completed: { label: "FINALIZED", color: "bg-emerald-50 text-emerald-600", icon: ShieldCheck },
    };
    const config = variants[status] || { label: status.toUpperCase(), color: "border border-slate-100 text-slate-300" };
    return (
      <div className={cn("flex items-center gap-3 px-5 py-2 rounded-full shadow-sm", config.color)}>
        {config.icon && <config.icon className="h-4 w-4" />}
        <span className="text-[10px] font-black uppercase tracking-widest">{config.label}</span>
      </div>
    );
  };

  const steps = [
    { id: "received", label: "QUEUE", icon: Clock },
    { id: "processing", label: "STAGING", icon: Package },
    { id: "delivery", label: "TRANSIT", icon: Truck },
    { id: "completed", label: "FINALIZED", icon: ShieldCheck },
  ];

  const getCurrentStepIndex = () => {
    if (order.status === "completed") return 3;
    if (order.status === "out_for_delivery") return 2;
    if (order.status === "processing") return 1;
    return 0;
  };

  const activeIndex = getCurrentStepIndex();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-3xl overflow-y-auto p-0 border-none bg-white shadow-2xl transition-none relative">
        <div className="absolute top-0 left-0 w-3 h-full bg-slate-900 z-50" />
        <div className="sticky top-0 z-30 bg-white/95 border-b border-slate-50 p-12 backdrop-blur-xl pl-16">
          <SheetHeader className="space-y-10">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="h-14 w-14 rounded-full bg-slate-50 hover:bg-slate-900 text-slate-300 hover:text-white transition-none border border-slate-100 hover:border-slate-800 shadow-sm"
              >
                <ChevronLeft className="h-7 w-7" />
              </Button>
              {getStatusBadge(order.status, order.pharmacy_ack_status)}
            </div>
            <div className="space-y-4">
              <SheetTitle className="text-4xl font-black tracking-tighter text-slate-900 leading-none uppercase">
                {order.code}
              </SheetTitle>
              <div className="flex items-center gap-5">
                  <div className="h-1.5 w-10 bg-brand-teal rounded-full shadow-[0_0_10px_rgba(20,184,166,0.6)]" />
                  <SheetDescription className="font-black text-[11px] uppercase tracking-[0.25em] text-slate-400 leading-none">Operational Manifest & Stream Protocol</SheetDescription>
              </div>
            </div>
          </SheetHeader>
        </div>

        <div className="p-16 space-y-20 pb-48 pl-24">
          {/* Progress Timeline */}
          <div className="relative px-12">
            <div className="absolute top-8 left-0 w-full h-1.5 bg-slate-50" />
            <div className="relative flex justify-between">
              {steps.map((step, idx) => {
                const isActive = idx <= activeIndex;
                const isCurrent = idx === activeIndex;
                
                return (
                  <div key={step.id} className="flex flex-col items-center gap-5 z-10">
                    <div 
                      className={cn(
                        "w-16 h-16 rounded-3xl flex items-center justify-center border-4 transition-none",
                        isActive 
                          ? "bg-slate-900 border-white text-white shadow-2xl shadow-slate-900/30" 
                          : "bg-white border-slate-50 text-slate-200"
                      )}
                    >
                      <step.icon className={cn("h-7 w-7", isActive && idx < 3 && "text-brand-teal")} />
                    </div>
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-[0.3em]",
                      isActive ? "text-slate-900" : "text-slate-300"
                    )}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Logistics & Chronology */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="p-10 rounded-3xl bg-slate-50/30 border border-slate-100 space-y-8 transition-none shadow-sm">
               <div className="flex items-center gap-4 text-slate-300">
                  <Map className="h-5 w-5" />
                  <span className="text-[11px] font-black uppercase tracking-[0.3em]">LOGISTICS_VECTOR</span>
               </div>
               <div className="space-y-5">
                  <p className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">{order.delivery_area?.toUpperCase() || "UNIVERSAL_SECTOR"}</p>
                  {order.delivery_address_note && (
                    <div className="p-8 bg-white rounded-3xl border border-slate-100/50 space-y-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <Zap className="h-4 w-4 text-brand-teal" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">PAYLOAD_NOTE</p>
                      </div>
                      <p className="text-[12px] text-slate-600 font-black leading-relaxed uppercase tracking-tight italic">
                        &quot;{order.delivery_address_note.toUpperCase()}&quot;
                      </p>
                    </div>
                  )}
               </div>
            </div>

            <div className="p-10 rounded-3xl bg-slate-50/30 border border-slate-100 space-y-8 transition-none shadow-sm">
               <div className="flex items-center gap-4 text-slate-300">
                  <History className="h-5 w-5" />
                  <span className="text-[11px] font-black uppercase tracking-[0.3em]">TEMPORAL_NODE</span>
               </div>
               <div className="space-y-4">
                  <p className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">{new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}</p>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-slate-200" />
                    <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.25em]">SYNCHRONIZED AT {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }).toUpperCase()}</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Order Summary Section */}
          <div className="space-y-12">
            <div className="flex items-center justify-between px-2">
               <div className="flex items-center gap-6">
                  <div className="h-16 w-16 rounded-3xl bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-900/10">
                    <Terminal className="h-8 w-8 text-brand-teal" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-900 leading-none">SKU_REGISTRY_MATRIX</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Authenticated inventory payload mapping</p>
                  </div>
               </div>
               <div className="h-12 px-8 rounded-full bg-slate-900 text-white flex items-center text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-slate-900/20">
                 {itemsArray.length} STREAMS_MAPPED
               </div>
            </div>
            <div className="rounded-3xl border border-slate-100 bg-white overflow-hidden shadow-2xl shadow-slate-900/5 transition-none">
              {itemsArray.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-10 border-b border-slate-50 last:border-0 transition-none group/item hover:bg-slate-50/50">
                  <div className="flex items-center gap-10">
                    <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-slate-900 text-sm tabular-nums shadow-sm">
                      {index + 1 < 10 ? `0${index + 1}` : index + 1}
                    </div>
                    <div className="space-y-2">
                      <p className="text-base font-black text-slate-900 tracking-tight uppercase leading-none group-hover/item:text-brand-teal transition-none">{item.name.toUpperCase()}</p>
                      <div className="flex items-center gap-4">
                          <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest">UNITS: <span className="text-brand-teal">{item.quantity}</span></p>
                          <div className="h-1 w-6 bg-slate-100 rounded-full" />
                          <p className="text-[11px] text-slate-300 font-black uppercase tracking-widest">UID_HEX: {index.toString(16).toUpperCase()}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xl font-black tabular-nums text-slate-900 tracking-tighter">₵{(Number(item.price_ghs || item.price || 0) * Number(item.quantity || 1)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
              ))}
              
              <div className="bg-slate-50/30 p-16 space-y-10">
                <div className="flex justify-between text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
                  <span>SUBTOTAL_PAYLOAD</span>
                  <span className="tabular-nums">₵{Number(order.subtotal_ghs || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                {Number(order.delivery_fee_ghs) > 0 && (
                  <div className="flex justify-between text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
                    <span>LOGISTICS_FEE</span>
                    <span className="tabular-nums">₵{Number(order.delivery_fee_ghs).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                {Number(order.student_discount_ghs) > 0 && (
                  <div className="flex justify-between text-[11px] font-black text-emerald-500 uppercase tracking-[0.3em]">
                    <span>PARTNER_REBATE</span>
                    <span className="tabular-nums">-₵{Number(order.student_discount_ghs).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="h-px w-full bg-slate-100 my-6" />
                <div className="flex justify-between items-end">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]" />
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 leading-none">Fiscal Settlement Protocol</span>
                    </div>
                    <span className="text-6xl font-black tabular-nums text-slate-900 tracking-tighter leading-none block">₵{Number(order.total_price_ghs || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Actions */}
          <div className="space-y-12">
            <div className="flex items-center gap-5 px-2">
               <Activity className="h-5 w-5 text-brand-teal" />
               <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-900 leading-none">WORKFLOW_INTERVENTION</h3>
            </div>
            <div className="grid gap-6">
              {order.status === "received" && order.pharmacy_ack_status === "pending" && (
                <div className="flex flex-col gap-6">
                  <Button
                    size="lg"
                    className="h-20 bg-slate-900 hover:bg-slate-800 text-white font-black text-[12px] uppercase tracking-[0.2em] gap-5 rounded-full shadow-2xl shadow-slate-900/30 transition-none border-none"
                    onClick={onAccept}
                    disabled={loading && loadingAction === "accept"}
                  >
                    {!loading && <ShieldCheck className="h-8 w-8 text-brand-teal" />}
                    {loading && loadingAction === "accept" ? "PROTOCOL_SYNC..." : "ACCEPT_FULFILLMENT"}
                  </Button>
                  <Button
                    size="lg"
                    variant="ghost"
                    className="h-16 font-black text-[11px] uppercase tracking-widest text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-none border-none"
                    onClick={onDecline}
                    disabled={loading && loadingAction === "decline"}
                  >
                    {!loading && <XCircle className="h-6 w-6" />}
                    {loading && loadingAction === "decline" ? "REJECTING_NODE..." : "DECLINE_PROTOCOL"}
                  </Button>
                </div>
              )}

              {order.status === "processing" && (
                <Button
                  size="lg"
                  className="h-20 bg-slate-900 hover:bg-slate-800 text-white font-black text-[12px] uppercase tracking-[0.2em] gap-5 rounded-full shadow-2xl shadow-slate-900/30 transition-none border-none"
                  onClick={onMarkOutForDelivery}
                  disabled={loading && loadingAction === "out_for_delivery"}
                >
                  {!loading && <Truck className="h-8 w-8 text-brand-teal" />}
                  {loading && loadingAction === "out_for_delivery" ? "PROVISIONING_LOGISTICS..." : "EXECUTE_DISPATCH"}
                </Button>
              )}

              {order.status === "out_for_delivery" && (
                <Button
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[12px] uppercase tracking-[0.2em] h-20 gap-5 rounded-full shadow-2xl shadow-emerald-600/30 transition-none border-none"
                  onClick={onMarkCompleted}
                  disabled={loading && loadingAction === "completed"}
                >
                   {!loading && <ShieldCheck className="h-8 w-8" />}
                   {loading && loadingAction === "completed" ? "FINALIZING_STREAM..." : "FINALIZE_DELIVERY"}
                </Button>
              )}
            </div>

            {/* Communication Hub Integration */}
            <div className="pt-24 space-y-10 border-t border-slate-50">
               <div className="flex items-center gap-5 px-2">
                  <MessageSquare className="h-5 w-5 text-brand-teal" />
                  <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-900 leading-none">COMMAND_UPLINK</h3>
               </div>
               <div className="bg-slate-50/20 rounded-3xl border border-slate-100 overflow-hidden transition-none shadow-sm">
                 <OrderMessages orderId={order.id} userRole="pharmacy" />
               </div>
            </div>
            
            <div className="bg-slate-900 p-12 rounded-3xl border border-slate-800 flex items-start gap-8 shadow-2xl transition-none relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-brand-teal/5 rounded-bl-full -mr-12 -mt-12" />
               <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                  <Info className="h-8 w-8 text-brand-teal" />
               </div>
               <div className="space-y-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 leading-none">SECURITY_PROTOCOL</p>
                  <p className="text-[12px] font-black text-slate-300 leading-relaxed uppercase tracking-tight">
                    Synchronizing status triggers real-time telemetry logs and encrypted customer notification streams. Ensure SKU accuracy before final protocol commitment.
                  </p>
               </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
