"use client";

import { useState } from "react";
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
import { Check, X, Loader2, Package, MapPin, Calendar, ShieldCheck, ShieldAlert, Zap, History, Terminal, ArrowRight, Activity, Map } from "lucide-react";
import { moderateProductRequest } from "@/lib/admin-actions";
import { useToast } from "@/hooks/use-toast";
import { ProductSheet } from "./product-sheet";
import { cn } from "@/lib/utils";

interface ProductRequest {
  id: number;
  product_name: string;
  description: string | null;
  pharmacyName: string;
  pharmacyLocation: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export function RequestsTable({
  initialRequests,
  categories = [],
}: {
  initialRequests: ProductRequest[];
  categories?: any[];
}) {
  const [requests, setRequests] = useState<ProductRequest[]>(initialRequests);
  const [processing, setProcessing] = useState<number | null>(null);
  const { toast } = useToast();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [requestToApprove, setRequestToApprove] = useState<ProductRequest | null>(null);

  const getProductFromRequest = (req: ProductRequest) => ({
    name: req.product_name,
    description: req.description,
    category: "",
    price_ghs: 0,
    stock_level: 0,
    image_url: "",
  });

  const handleApproveClick = (request: ProductRequest) => {
    setRequestToApprove(request);
    setIsSheetOpen(true);
  };

  const handleReject = async (id: number) => {
    if (!confirm("Confirm denial of this SKU provisioning request? Operational node integrity will be maintained.")) return;
    setProcessing(id);
    try {
      const res = await moderateProductRequest(id, "rejected");

      if (res.success) {
        setRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: "rejected" } : r)),
        );
        toast({ title: "REQUEST_DENIED", description: "Node provisioning request rejected from global matrix." });
      } else {
        toast({
          variant: "destructive",
          title: "REGISTRY_ERROR",
          description: res.error || "Failed to finalize denial sync.",
        });
      }
    } catch (e) {
      toast({
        variant: "destructive",
        title: "TERMINAL_CRITICAL",
        description: "Protocol execution failed in master terminal.",
      });
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="space-y-16">
      <div className="overflow-hidden px-2">
        <Table className="min-w-[1200px]">
          <TableHeader className="bg-slate-50/30 border-b border-slate-50">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 py-10 pl-16">SKU_IDENTITY_PROPOSAL</TableHead>
              <TableHead className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 py-10">ORIGIN_NODE_STATION</TableHead>
              <TableHead className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 py-10 text-center">SYNCHRONIZATION_STATUS</TableHead>
              <TableHead className="hidden md:table-cell text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 py-10">TEMPORAL_REGISTRY_STAMP</TableHead>
              <TableHead className="text-right pr-16 py-10 text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">OPERATIONAL_MODERATION</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-80 text-center bg-transparent border-none">
                  <div className="flex flex-col items-center justify-center gap-12">
                    <div className="h-40 w-40 rounded-[48px] bg-white border border-slate-50 flex items-center justify-center shadow-2xl shadow-slate-900/10">
                        <Package className="h-20 w-20 text-slate-100" />
                    </div>
                    <div className="space-y-6">
                      <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.4em] leading-none">Registry Nominal State</h3>
                      <p className="text-[11px] font-black text-slate-200 uppercase tracking-[0.3em] max-w-lg mx-auto leading-relaxed">
                          All node provisioning requests have been processed. Global matrix integrity maintained across all terminal sectors.
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              requests.map((req) => (
                <TableRow key={req.id} className="group border-slate-50 hover:bg-slate-50/30 transition-none">
                  <TableCell className="pl-16 py-12">
                    <div className="flex items-center gap-10">
                        <div className="h-16 w-16 rounded-[24px] bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-900/10">
                            <Terminal className="h-8 w-8 text-brand-teal" />
                        </div>
                        <div className="flex flex-col gap-3">
                            <span className="font-black text-slate-900 uppercase tracking-tight text-base leading-none block">{req.product_name}</span>
                            {req.description && (
                            <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest truncate max-w-[400px] leading-none">
                                {req.description.toUpperCase()}
                            </span>
                            )}
                        </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-12">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4 px-6 py-3 rounded-full bg-slate-50 border border-slate-100 w-fit shadow-sm">
                             <Activity className="h-4 w-4 text-slate-300" />
                             <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest leading-none">{req.pharmacyName.toUpperCase()}</span>
                        </div>
                        <div className="flex items-center gap-4 pl-6 text-[10px] font-black text-slate-200 uppercase tracking-widest leading-none">
                          <MapPin className="h-4 w-4 text-slate-100" />
                          {req.pharmacyLocation.toUpperCase()}
                        </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-12 text-center">
                    <div className="flex justify-center">
                        <div className={cn(
                            "flex items-center gap-4 px-8 py-3.5 rounded-full shadow-sm w-fit transition-none border-none",
                            req.status === "approved" ? "bg-emerald-500/10 text-emerald-600 shadow-emerald-500/5" : 
                            req.status === "rejected" ? "bg-rose-500/10 text-rose-600 shadow-rose-500/5" : 
                            "bg-amber-500/10 text-amber-600 shadow-amber-500/5"
                        )}>
                            <div className={cn(
                                "h-2 w-2 rounded-full",
                                req.status === "approved" ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)]" : 
                                req.status === "rejected" ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.7)]" : 
                                "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.7)]"
                            )} />
                            <span className="text-[11px] font-black uppercase tracking-[0.25em]">{req.status.toUpperCase()}</span>
                        </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell py-12">
                    <div className="h-12 px-8 rounded-full bg-slate-50 border border-slate-100 flex items-center gap-4 shadow-sm w-fit">
                        <Calendar className="h-5 w-5 text-slate-200" />
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] leading-none tabular-nums">
                            {new Date(req.created_at).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase()}
                        </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-16 py-12">
                    {req.status === "pending" && (
                      <div className="flex justify-end gap-6">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-16 w-16 rounded-[24px] bg-slate-900 text-brand-teal hover:bg-slate-800 shadow-2xl shadow-slate-900/40 transition-none border-none group"
                          onClick={() => handleApproveClick(req)}
                          disabled={!!processing}
                        >
                          <ShieldCheck className="h-8 w-8 group-hover:scale-110 transition-transform duration-300" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-16 w-16 rounded-[24px] bg-rose-50 text-rose-500 hover:bg-rose-100 transition-none shadow-sm border-none group"
                          onClick={() => handleReject(req.id)}
                          disabled={!!processing}
                        >
                          {processing === req.id ? (
                            <Loader2 className="h-6 w-6 animate-spin" />
                          ) : (
                            <ShieldAlert className="h-8 w-8 group-hover:scale-110 transition-transform duration-300" />
                          )}
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ProductSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        product={
          requestToApprove ? getProductFromRequest(requestToApprove) : undefined
        }
        categories={categories}
        requestId={requestToApprove?.id}
      />

      {/* Matrix Status Feed */}
      <div className="pt-12 border-t border-slate-50 flex items-center gap-6 px-4">
        <div className="h-2 w-12 bg-brand-teal rounded-full shadow-[0_0_12px_rgba(20,184,166,0.6)]" />
        <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em]">Provisioning matrix synchronized with global SKU registry and master terminal control nodes.</p>
      </div>
    </div>
  );
}
