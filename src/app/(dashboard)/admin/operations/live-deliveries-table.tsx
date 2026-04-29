"use client";

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
import { formatDistanceToNow } from "date-fns";
import { MapPin, Phone, Truck, Clock, ShieldAlert, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function LiveDeliveriesTable({ orders }: { orders: any[] }) {
  if (!orders || orders.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-muted/20">
        <p className="text-muted-foreground">No active orders right now.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200/80 shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow className="hover:bg-transparent border-slate-100">
            <TableHead className="py-6 pl-8 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Logistics Track</TableHead>
            <TableHead className="py-6 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Duration Pulse</TableHead>
            <TableHead className="py-6 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Real-time Status</TableHead>
            <TableHead className="py-6 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Source Pharmacy</TableHead>
            <TableHead className="py-6 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Assigned Rider</TableHead>
            <TableHead className="py-6 pr-8 text-right text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Intervention</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow
              key={order.id}
              className={cn(
                "group border-slate-50 transition-colors",
                order.isStuck ? "bg-red-50/30 hover:bg-red-50/50" : "hover:bg-slate-50/50"
              )}
            >
              <TableCell className="py-6 pl-8">
                <div className="flex flex-col gap-1">
                  <div className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                    {order.code}
                    {order.isStuck && <ShieldAlert className="h-3.5 w-3.5 text-red-500 animate-pulse" />}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 flex items-center uppercase tracking-tight">
                    <MapPin className="h-3 w-3 mr-1.5 text-slate-300" /> {order.delivery_area}
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-6">
                <div className="flex flex-col">
                  <div className={cn(
                    "text-sm font-black tabular-nums tracking-tighter",
                    order.isStuck ? "text-red-600" : "text-slate-900"
                  )}>
                    {order.minutesElapsed} <span className="text-[10px] uppercase tracking-widest font-bold ml-0.5">mins</span>
                  </div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mt-1">
                    <Clock className="h-2.5 w-2.5" />
                    {new Date(order.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-6">
                <Badge
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-[9px] font-black uppercase tracking-wider border-2 shadow-none",
                    order.status === "out_for_delivery"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                      : order.status === "processing"
                        ? "bg-amber-50 text-amber-700 border-amber-100"
                        : "bg-slate-50 text-slate-600 border-slate-100"
                  )}
                >
                  <Truck className="mr-1.5 h-3 w-3" />
                  {order.status.replace(/_/g, " ")}
                </Badge>
              </TableCell>
              <TableCell className="py-6">
                <span className="text-[11px] font-black text-slate-600 bg-slate-100 px-2 py-1 rounded-lg uppercase tracking-tight">
                  {order.pharmacyName}
                </span>
              </TableCell>
              <TableCell className="py-6">
                {order.courier_name ? (
                  <div className="flex flex-col gap-0.5">
                    <div className="text-xs font-black text-slate-900 uppercase tracking-tight">{order.courier_name}</div>
                    <div className="text-[10px] font-bold text-slate-400 flex items-center">
                      <Phone className="h-2.5 w-2.5 mr-1 text-slate-300" /> {order.courier_phone}
                    </div>
                  </div>
                ) : (
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Awaiting Rider</span>
                )}
              </TableCell>
              <TableCell className="py-6 pr-8 text-right">
                <Link href={`/admin/orders?search=${order.code}`}>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2 bg-slate-900 text-white hover:bg-slate-800 hover:text-white shadow-lg shadow-slate-200 transition-all active:scale-95"
                  >
                    Control
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
