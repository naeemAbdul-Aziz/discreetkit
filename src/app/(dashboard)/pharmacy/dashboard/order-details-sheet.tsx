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
  Info
} from "lucide-react";
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
      return <Badge variant="success" className="gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border-emerald-100 font-bold uppercase text-[10px] tracking-wider"><Package className="h-3 w-3" /> Preparing</Badge>;
    }
    const variants: any = {
      received: { variant: "secondary", label: "New Order" },
      processing: { variant: "info", label: "Preparing" },
      out_for_delivery: { variant: "warning", label: "Out for Delivery" },
      completed: { variant: "success", label: "Delivered" },
    };
    const config = variants[status] || { variant: "neutral", label: status };
    return <Badge variant={config.variant} className="px-3 py-1 font-bold uppercase text-[10px] tracking-wider">{config.label}</Badge>;
  };

  const steps = [
    { id: "received", label: "Received", icon: Clock },
    { id: "processing", label: "Preparing", icon: Package },
    { id: "delivery", label: "Delivery", icon: Truck },
    { id: "completed", label: "Delivered", icon: CheckCircle },
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
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto p-0 border-none bg-slate-50/50">
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-100 p-6">
          <SheetHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="h-10 w-10 rounded-xl hover:bg-slate-100"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              {getStatusBadge(order.status, order.pharmacy_ack_status)}
            </div>
            <div>
              <SheetTitle className="text-2xl font-black tracking-tighter text-slate-900 font-mono">
                {order.code}
              </SheetTitle>
              <SheetDescription className="font-medium text-slate-500">Dispatch Command Center</SheetDescription>
            </div>
          </SheetHeader>
        </div>

        <div className="p-6 space-y-8 pb-32">
          {/* Progress Stepper */}
          <div className="relative px-2">
            <div className="absolute top-4 left-0 w-full h-0.5 bg-slate-200" />
            <div className="relative flex justify-between">
              {steps.map((step, idx) => {
                const isActive = idx <= activeIndex;
                const isCurrent = idx === activeIndex;
                
                return (
                  <div key={step.id} className="flex flex-col items-center gap-3 z-10">
                    <motion.div 
                      initial={false}
                      animate={{ 
                        backgroundColor: isActive ? "var(--brand-teal)" : "#f1f5f9",
                        scale: isCurrent ? 1.1 : 1,
                        borderColor: isCurrent ? "var(--brand-teal)" : "transparent"
                      }}
                      style={{ backgroundColor: isActive ? "#188179" : "#f1f5f9" }}
                      className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center border-2 transition-shadow shadow-sm",
                        isActive ? "text-white shadow-brand-teal/20" : "text-slate-400 border-slate-200"
                      )}
                    >
                      <step.icon className="h-4 w-4" />
                    </motion.div>
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest",
                      isActive ? "text-brand-teal" : "text-slate-400 alpha-60"
                    )}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-100 space-y-3 shadow-sm">
               <div className="flex items-center gap-2 text-brand-teal">
                  <MapPin className="h-4 w-4" />
                  <span className="text-[11px] font-black uppercase tracking-wider">Destination</span>
               </div>
               <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-900">{order.delivery_area}</p>
                  {order.delivery_address_note && (
                    <p className="text-xs text-slate-500 font-medium leading-relaxed italic border-l-2 border-slate-100 pl-3">
                      &quot;{order.delivery_address_note}&quot;
                    </p>
                  )}
               </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-100 space-y-3 shadow-sm">
               <div className="flex items-center gap-2 text-brand-teal">
                  <Calendar className="h-4 w-4" />
                  <span className="text-[11px] font-black uppercase tracking-wider">Timeline</span>
               </div>
               <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-900">{new Date(order.created_at).toLocaleDateString()}</p>
                  <p className="text-xs text-slate-500 font-medium">Logged at {new Date(order.created_at).toLocaleTimeString()}</p>
               </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
               <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                 <Package className="h-4 w-4" /> Order Items
               </h3>
               <Badge variant="outline" className="rounded-full bg-white font-bold">{itemsArray.length} Pieces</Badge>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm">
              {itemsArray.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500 font-medium">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="text-sm font-black tabular-nums text-slate-900">₵{(Number(item.price_ghs || item.price || 0) * Number(item.quantity || 1)).toFixed(2)}</p>
                </div>
              ))}
              
              <div className="bg-slate-50/50 p-6 space-y-3">
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>Subtotal</span>
                  <span className="tabular-nums">₵{Number(order.subtotal || 0).toFixed(2)}</span>
                </div>
                {Number(order.delivery_fee) > 0 && (
                  <div className="flex justify-between text-xs font-bold text-slate-500">
                    <span>Delivery Service</span>
                    <span className="tabular-nums">₵{Number(order.delivery_fee).toFixed(2)}</span>
                  </div>
                )}
                {Number(order.student_discount) > 0 && (
                  <div className="flex justify-between text-xs font-bold text-emerald-600">
                    <span>Student Discount</span>
                    <span className="tabular-nums">-₵{Number(order.student_discount).toFixed(2)}</span>
                  </div>
                )}
                <Separator className="bg-slate-200" />
                <div className="flex justify-between items-end">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">Total Command Value</span>
                  <span className="text-2xl font-black tabular-nums text-slate-900">₵{Number(order.total_price || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Center - Floating Bottom? */}
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-2 px-1">
               <ArrowRight className="h-4 w-4" /> Command Execution
            </h3>
            <div className="grid gap-3">
              {order.status === "received" && order.pharmacy_ack_status === "pending" && (
                <>
                  <Button
                    size="lg"
                    className="h-14 bg-brand-teal hover:bg-brand-teal-dark font-black text-sm gap-3 shadow-xl shadow-brand-teal/20 rounded-2xl"
                    onClick={onAccept}
                    loading={loading && loadingAction === "accept"}
                  >
                    {!loading && <CheckCircle className="h-5 w-5" />}
                    Accept and Start Fulfilling
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 border-rose-200 text-rose-600 hover:bg-rose-50 font-black text-sm gap-3 rounded-2xl"
                    onClick={onDecline}
                    loading={loading && loadingAction === "decline"}
                  >
                    {!loading && <XCircle className="h-5 w-5" />}
                    Decline Order
                  </Button>
                </>
              )}

              {order.status === "processing" && (
                <Button
                  size="lg"
                  className="h-14 bg-brand-indigo hover:bg-brand-indigo-dark font-black text-sm gap-3 shadow-xl shadow-brand-indigo/20 rounded-2xl"
                  onClick={onMarkOutForDelivery}
                  loading={loading && loadingAction === "out_for_delivery"}
                >
                  {!loading && <Truck className="h-6 w-6 animate-breathing" />}
                  Dispatch to Courier
                </Button>
              )}

              {order.status === "out_for_delivery" && (
                <Button
                  size="lg"
                  className="h-14 bg-emerald-600 hover:bg-emerald-700 font-black text-sm gap-3 shadow-xl shadow-emerald-600/20 rounded-2xl"
                  onClick={onMarkCompleted}
                  loading={loading && loadingAction === "completed"}
                >
                   {!loading && <CheckCircle className="h-6 w-6" />}
                   Confirm Successful Handover
                </Button>
              )}
            </div>
          </div>

          {/* Communication Hub */}
          <div className="space-y-4">
             <div className="flex items-center gap-2 px-1">
                <GanttChartSquare className="h-4 w-4 text-brand-teal" />
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Communication Hub</h3>
             </div>
             <OrderMessages orderId={order.id} userRole="pharmacy" />
          </div>
          
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
             <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
             <p className="text-[11px] font-medium text-blue-700 leading-relaxed">
               Every status update sends an automated notification to the customer. Please ensure accuracy before execution.
             </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
