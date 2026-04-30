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
import { MapPin, Phone, Truck, Clock, ShieldAlert, ArrowRight, Zap, Network, Activity, ShieldCheck, Terminal, Map } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function LiveDeliveriesTable({ orders }: { orders: any[] }) {
  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-60 gap-12 bg-white rounded-[40px] border border-slate-50 shadow-2xl shadow-slate-900/5">
        <div className="h-32 w-32 rounded-[40px] bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-900/20">
            <Zap className="h-16 w-16 text-slate-700" />
        </div>
        <div className="space-y-4 text-center">
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">REGISTRY_NOMINAL_STATE</p>
            <p className="text-[11px] font-black text-slate-200 uppercase tracking-[0.3em]">No active operational streams found in the global logistics matrix.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
        <Table className="min-w-[1200px]">
        <TableHeader className="bg-slate-50/30 border-b border-slate-50">
            <TableRow className="hover:bg-transparent border-none">
            <TableHead className="py-10 pl-12 text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">OPERATIONAL_STREAM_IDENTITY</TableHead>
            <TableHead className="py-10 text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 text-center">PROTOCOL_LATENCY</TableHead>
            <TableHead className="py-10 text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 text-center">FULFILLMENT_STATUS</TableHead>
            <TableHead className="py-10 text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">MASTER_NODE_ORIGIN</TableHead>
            <TableHead className="py-10 text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">LOGISTICS_NODE_STATION</TableHead>
            <TableHead className="py-10 pr-12 text-right text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">CONTROL</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {orders.map((order) => (
            <TableRow
                key={order.id}
                className={cn(
                "border-slate-50 transition-none group",
                order.isStuck ? "bg-rose-500/5" : "hover:bg-slate-50/30"
                )}
            >
                <TableCell className="py-12 pl-12">
                <div className="flex items-center gap-8">
                    <div className={cn(
                        "h-16 w-16 rounded-[24px] flex items-center justify-center shadow-2xl transition-transform duration-500 group-hover:scale-110",
                        order.isStuck ? "bg-rose-600 shadow-rose-600/30" : "bg-slate-900 shadow-slate-900/20"
                    )}>
                        <Terminal className={cn("h-8 w-8", order.isStuck ? "text-white" : "text-brand-teal")} />
                    </div>
                    <div className="flex flex-col gap-3">
                        <div className="text-base font-black text-slate-900 tracking-tighter uppercase flex items-center gap-4">
                        {order.code}
                        {order.isStuck && <Badge variant="destructive" className="h-6 rounded-full px-4 text-[9px] font-black uppercase tracking-widest border-none animate-pulse">ESCALATED</Badge>}
                        </div>
                        <div className="text-[10px] font-black text-slate-300 flex items-center uppercase tracking-widest leading-none">
                        <MapPin className="h-3.5 w-3.5 mr-2 text-slate-200" /> {order.delivery_area.toUpperCase()}
                        </div>
                    </div>
                </div>
                </TableCell>
                <TableCell className="py-12">
                <div className="flex flex-col items-center gap-3">
                    <div className={cn(
                    "text-xl font-black tabular-nums tracking-tighter leading-none px-6 py-3 rounded-2xl",
                    order.isStuck ? "bg-rose-500/10 text-rose-600" : "bg-slate-50 text-slate-900"
                    )}>
                    {order.minutesElapsed}<span className="text-[10px] uppercase tracking-widest text-slate-300 ml-2 font-black">MIN_ELAPSED</span>
                    </div>
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
                    <Clock className="h-3 w-3 text-slate-200" />
                    {new Date(order.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}_EST
                    </div>
                </div>
                </TableCell>
                <TableCell className="py-12">
                <div className="flex justify-center">
                    <div className={cn(
                        "flex items-center gap-4 px-8 py-3.5 rounded-full shadow-sm w-fit transition-none border-none",
                        order.status === "out_for_delivery" ? "bg-emerald-500/10 text-emerald-600 shadow-emerald-500/5" : 
                        order.status === "processing" ? "bg-amber-500/10 text-amber-600 shadow-amber-500/5" : 
                        "bg-slate-900 text-white shadow-slate-900/10"
                    )}>
                        <div className={cn(
                            "h-2 w-2 rounded-full",
                            order.status === "out_for_delivery" ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)]" : 
                            order.status === "processing" ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.7)]" : 
                            "bg-brand-teal shadow-[0_0_10px_rgba(20,184,166,0.7)]"
                        )} />
                        <span className="text-[10px] font-black uppercase tracking-[0.25em]">{order.status.toUpperCase().replace(/_/g, " ")}</span>
                    </div>
                </div>
                </TableCell>
                <TableCell className="py-12">
                <div className="flex items-center gap-4 group/node">
                    <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover/node:bg-slate-900 group-hover/node:border-slate-900 transition-colors duration-300">
                        <Network className="h-6 w-6 text-slate-300 group-hover/node:text-brand-teal transition-colors" />
                    </div>
                    <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest truncate max-w-[180px] leading-none block group-hover/node:text-slate-900 transition-none">
                    {order.pharmacyName.toUpperCase()}
                    </span>
                </div>
                </TableCell>
                <TableCell className="py-12">
                {order.courier_name ? (
                    <div className="flex items-center gap-6 group/courier">
                        <div className="h-12 w-12 rounded-full bg-brand-teal/10 flex items-center justify-center border border-brand-teal/20 group-hover/courier:bg-slate-900 group-hover/courier:border-slate-900 transition-colors duration-300">
                            <Activity className="h-6 w-6 text-brand-teal" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="text-[11px] font-black text-slate-900 uppercase tracking-widest leading-none block">{order.courier_name.toUpperCase()}</div>
                            <div className="text-[10px] font-black text-slate-300 flex items-center uppercase tracking-widest leading-none tabular-nums">
                                <Phone className="h-3.5 w-3.5 mr-2 text-slate-200" /> {order.courier_phone}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-4 px-6 py-3 rounded-full bg-slate-50/50 border border-slate-50 w-fit">
                        <Loader2 className="h-4 w-4 text-slate-200 animate-spin" />
                        <span className="text-[10px] font-black text-slate-200 uppercase tracking-widest">PROTOCOL_PENDING</span>
                    </div>
                )}
                </TableCell>
                <TableCell className="py-12 pr-12 text-right">
                <Link href={`/admin/orders?search=${order.code}`}>
                    <Button 
                        className="h-16 px-12 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-black text-[11px] uppercase tracking-[0.3em] gap-6 shadow-2xl shadow-slate-900/40 transition-none border-none group/btn"
                    >
                        MASTER_TERMINAL
                        <ArrowRight className="h-5 w-5 text-brand-teal group-hover:translate-x-2 transition-transform duration-300" />
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
