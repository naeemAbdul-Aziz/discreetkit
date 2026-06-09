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
import { Separator } from "@/components/ui/separator";
import { Icon } from "@/components/ui/icon";
import { OrderMessages } from "@/components/order-messages";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
      return <Badge variant="success" className="gap-1.5 px-3 py-1 bg-teal-50 text-brand-teal border-teal-100 font-black uppercase text-[9px] tracking-widest rounded-md"><Icon name="inventory_2" opticalSize={12} /> Fulfilling</Badge>;
    }
    const variants: any = {
      received: { variant: "secondary", label: "Awaiting Action", color: "bg-slate-100 text-slate-600" },
      processing: { variant: "info", label: "In Preparation", color: "bg-indigo-50 text-brand-indigo" },
      out_for_delivery: { variant: "warning", label: "In Transit", color: "bg-amber-50 text-amber-600" },
      completed: { variant: "success", label: "Handed Over", color: "bg-emerald-50 text-emerald-600" },
    };
    const config = variants[status] || { variant: "neutral", label: status, color: "bg-slate-100 text-slate-500" };
    return <Badge className={cn("px-3 py-1 font-black uppercase text-[9px] tracking-widest border-none rounded-md", config.color)}>{config.label}</Badge>;
  };

  const steps = [
    { id: "received", label: "Queue", icon: "schedule" },
    { id: "processing", label: "Prep", icon: "inventory_2" },
    { id: "delivery", label: "Logistics", icon: "local_shipping" },
    { id: "completed", label: "Finalized", icon: "check_circle" },
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
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto p-0 border-none bg-white shadow-2xl">
        <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-100/50 p-8">
          <SheetHeader className="space-y-6">
            <div className="flex items-center justify-between">
              <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onOpenChange(false)}
                        className="h-10 w-10 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition-all"
                      >
                        <Icon name="chevron_left" opticalSize={20} />
              </Button>
              {getStatusBadge(order.status, order.pharmacy_ack_status)}
            </div>
            <div className="space-y-1">
              <SheetTitle className="text-3xl font-extrabold tracking-tight text-slate-900 leading-none">
                {order.code}
              </SheetTitle>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-indigo animate-pulse" />
                <SheetDescription className="font-bold text-[10px] uppercase tracking-[0.2em] text-slate-400">Order Details</SheetDescription>
              </div>
            </div>
          </SheetHeader>
        </div>

        <div className="p-8 space-y-10 pb-32 animate-in fade-in slide-in-from-right-4 duration-500">
          {/* Progress Timeline */}
          <div className="relative px-4">
            <div className="absolute top-5 left-0 w-full h-[1px] bg-slate-100" />
            <div className="relative flex justify-between">
              {steps.map((step, idx) => {
                const isActive = idx <= activeIndex;
                const isCurrent = idx === activeIndex;
                
                return (
                  <div key={step.id} className="flex flex-col items-center gap-4 z-10">
                    <motion.div 
                      initial={false}
                      animate={{ 
                        scale: isCurrent ? 1.15 : 1,
                      }}
                      className={cn(
                        "w-10 h-10 rounded-2xl flex items-center justify-center border-4 transition-all duration-500",
                        isActive 
                          ? "bg-brand-indigo border-indigo-50 text-white shadow-xl shadow-brand-indigo/10" 
                          : "bg-white border-slate-50 text-slate-300"
                      )}
                    >
                      <Icon name={step.icon as string} opticalSize={16} className="text-current" />
                    </motion.div>
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-[0.15em] transition-colors duration-500",
                      isActive ? "text-brand-indigo" : "text-slate-300"
                    )}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery & Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-6 rounded-[2rem] bg-slate-50/50 border border-slate-100/50 space-y-4 group hover:bg-white hover:shadow-xl hover:shadow-slate-200/20 transition-all">
               <div className="flex items-center gap-2 text-brand-indigo opacity-60 group-hover:opacity-100">
                  <Icon name="location_on" opticalSize={14} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Delivery Address</span>
               </div>
               <div className="space-y-2">
                  <p className="text-base font-extrabold text-slate-900 tracking-tight">{order.delivery_area}</p>
                  {order.delivery_address_note && (
                    <div className="p-3 bg-white rounded-xl border border-slate-100/50">
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic">
                        &quot;{order.delivery_address_note}&quot;
                      </p>
                    </div>
                  )}
               </div>
            </div>

            <div className="p-6 rounded-[2rem] bg-slate-50/50 border border-slate-100/50 space-y-4 group hover:bg-white hover:shadow-xl hover:shadow-slate-200/20 transition-all">
               <div className="flex items-center gap-2 text-brand-indigo opacity-60 group-hover:opacity-100">
                  <Icon name="calendar_today" opticalSize={14} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Order Timeline</span>
               </div>
               <div className="space-y-1">
                  <p className="text-base font-extrabold text-slate-900 tracking-tight">{new Date(order.created_at).toLocaleDateString('en-GB')}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Placed at {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
               </div>
            </div>
          </div>

          {/* Order Summary Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
               <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2.5">
                 <Icon name="inventory_2" opticalSize={14} className="text-brand-indigo" /> Order Items
               </h3>
               <span className="text-[10px] font-black bg-slate-900 text-white px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg shadow-slate-900/10">
                 {itemsArray.length} Selected Items
               </span>
            </div>
            <div className="rounded-[2.5rem] border border-slate-100/80 bg-white overflow-hidden shadow-sm">
              {itemsArray.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-6 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-all group">
                  <div className="flex items-center gap-5">
                    <div className="w-11 h-11 rounded-2xl bg-white border border-slate-100 flex items-center justify-center font-black text-slate-900 text-[10px] shadow-sm group-hover:scale-110 transition-transform">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-slate-900 tracking-tight">{item.name}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Quantity: <span className="text-brand-indigo">{item.quantity}</span></p>
                    </div>
                  </div>
                  <p className="text-sm font-black tabular-nums text-slate-900">₵{(Number(item.price_ghs || item.price || 0) * Number(item.quantity || 1)).toFixed(2)}</p>
                </div>
              ))}
              
              <div className="bg-slate-50/80 p-8 space-y-4">
                <div className="flex justify-between text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span className="tabular-nums">₵{Number(order.subtotal_ghs || 0).toFixed(2)}</span>
                </div>
                {Number(order.delivery_fee_ghs) > 0 && (
                  <div className="flex justify-between text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    <span>Logistics Service</span>
                    <span className="tabular-nums">₵{Number(order.delivery_fee_ghs).toFixed(2)}</span>
                  </div>
                )}
                {Number(order.student_discount_ghs) > 0 && (
                  <div className="flex justify-between text-[11px] font-bold text-brand-teal uppercase tracking-widest">
                    <span>Partnership Rebate</span>
                    <span className="tabular-nums">-₵{Number(order.student_discount_ghs).toFixed(2)}</span>
                  </div>
                )}
                <div className="h-[1px] w-full bg-slate-200/50 my-2" />
                <div className="flex justify-between items-end">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 block leading-none mb-1">Total Amount (GHS)</span>
                    <span className="text-4xl font-extrabold tabular-nums text-slate-900 tracking-tighter leading-none block">₵{Number(order.total_price_ghs || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Actions */}
          <div className="space-y-6 pb-12">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2.5 px-2">
               <Icon name="arrow_forward" opticalSize={14} className="text-brand-indigo" /> Order Actions
            </h3>
            <div className="grid gap-4">
              {order.status === "received" && order.pharmacy_ack_status === "pending" && (
                <div className="flex flex-col gap-3">
                  <Button
                    size="lg"
                    className="h-16 bg-brand-indigo hover:bg-brand-indigo/90 font-black text-sm uppercase tracking-widest gap-3 shadow-2xl shadow-brand-indigo/20 rounded-2xl transition-all hover:scale-[1.01]"
                    onClick={onAccept}
                    loading={loading && loadingAction === "accept"}
                  >
                     {!loading && <Icon name="check_circle" opticalSize={20} fill />}
                    Accept Order
                  </Button>
                  <Button
                    size="lg"
                    variant="ghost"
                    className="h-14 font-black text-[10px] uppercase tracking-[0.18em] text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                    onClick={onDecline}
                    loading={loading && loadingAction === "decline"}
                  >
                     {!loading && <Icon name="cancel" opticalSize={16} />}
                    Decline Order
                  </Button>
                </div>
              )}

              {order.status === "processing" && (
                <Button
                  size="lg"
                  className="h-16 bg-brand-indigo hover:bg-brand-indigo/90 font-black text-sm uppercase tracking-widest gap-3 shadow-2xl shadow-brand-indigo/20 rounded-2xl transition-all hover:scale-[1.01]"
                  onClick={onMarkOutForDelivery}
                  loading={loading && loadingAction === "out_for_delivery"}
                >
                   {!loading && <Icon name="local_shipping" opticalSize={24} />}
                  Ready for Delivery
                </Button>
              )}

              {order.status === "out_for_delivery" && (
                <Button
                  size="lg"
                  className="h-16 bg-brand-teal hover:bg-teal-700 font-black text-sm uppercase tracking-widest gap-3 shadow-2xl shadow-brand-teal/20 rounded-2xl transition-all hover:scale-[1.01]"
                  onClick={onMarkCompleted}
                  loading={loading && loadingAction === "completed"}
                >
                    {!loading && <Icon name="check_circle" opticalSize={24} fill />}
                   Mark as Delivered
                </Button>
              )}
            </div>

            {/* Communication Hub Integration */}
            <div className="pt-8 space-y-6 border-t border-slate-100">
               <div className="flex items-center gap-2.5 px-2">
                  <Icon name="list_alt" opticalSize={14} className="text-brand-indigo" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Order Chat</h3>
               </div>
               <div className="bg-slate-50/50 rounded-[2.5rem] border border-slate-100/50 overflow-hidden">
                 <OrderMessages orderId={order.id} userRole="pharmacy" />
               </div>
            </div>
            
            <div className="bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100/50 flex items-start gap-4 transition-all hover:bg-indigo-50">
               <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center border border-indigo-100 shadow-sm shrink-0">
                  <Icon name="info" opticalSize={20} className="text-brand-indigo" fill />
               </div>
               <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-900/60 block mb-1">Processing Note</p>
                  <p className="text-[11px] font-semibold text-indigo-900 leading-relaxed">
                    Status updates trigger automated notifications. Ensure all physical items are checked before updating.
                  </p>
               </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
