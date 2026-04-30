"use client";

import React, { useState } from "react";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
    CreditCard, 
    Package, 
    Truck, 
    Repeat, 
    Clock, 
    Search, 
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    FileText,
    ChevronDown,
    ChevronUp,
    Activity,
    ShieldCheck,
    Calendar,
    Network,
    Terminal,
    Zap,
    Map,
    ArrowRight,
    ShieldAlert,
    History
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { LedgerEntry, LedgerCategory } from "@/lib/admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LedgerTableProps {
    entries: LedgerEntry[];
    showPharmacy?: boolean;
    hideControls?: boolean;
}

export function LedgerTable({ entries, showPharmacy = true, hideControls = false }: LedgerTableProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<LedgerCategory | "ALL">("ALL");
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 12;

    const toggleRow = (id: string) => {
        const next = new Set(expandedRows);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setExpandedRows(next);
    };

    const filtered = entries.filter(e => {
        const matchesSearch = 
            e.order_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.pharmacy_name?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCategory = categoryFilter === "ALL" || e.category === categoryFilter;
        
        return matchesSearch && matchesCategory;
    });

    const totalPages = Math.ceil(filtered.length / pageSize);
    const paginatedEntries = filtered.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const getCategoryIcon = (category: LedgerCategory) => {
        switch (category) {
            case 'FINANCE': return <CreditCard className="h-5 w-5" />;
            case 'DISPENSATION': return <Package className="h-5 w-5" />;
            case 'LOGISTICS': return <Truck className="h-5 w-5" />;
            case 'SUBSCRIPTION': return <Repeat className="h-5 w-5" />;
        }
    };

    const getCategoryStyles = (category: LedgerCategory) => {
        switch (category) {
            case 'FINANCE': return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
            case 'DISPENSATION': return "bg-brand-teal/10 text-brand-teal border-brand-teal/20";
            case 'LOGISTICS': return "bg-amber-500/10 text-amber-600 border-amber-500/20";
            case 'SUBSCRIPTION': return "bg-sky-500/10 text-sky-600 border-sky-500/20";
        }
    };

    return (
        <div className="space-y-16">
            {/* Control Interface */}
            {!hideControls && (
                <div className="flex flex-col xl:flex-row items-center gap-12 bg-slate-50/50 p-4 rounded-[40px] border border-slate-100 transition-none shadow-sm">
                    <div className="relative flex-1 w-full group">
                        <Search className="absolute left-10 top-1/2 -translate-y-1/2 h-7 w-7 text-slate-300 group-focus-within:text-brand-teal transition-none" />
                        <Input 
                            type="text" 
                            placeholder="PROTOCOL SEARCH: FILTER AUDIT LOGS..." 
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full h-20 pl-24 pr-12 rounded-[32px] border-none bg-white text-[13px] font-black uppercase tracking-[0.3em] placeholder:text-slate-200 transition-none focus-visible:ring-0 shadow-sm focus-visible:shadow-2xl shadow-slate-900/5"
                        />
                    </div>
                    <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide px-4 py-2">
                        {(['ALL', 'FINANCE', 'DISPENSATION', 'LOGISTICS', 'SUBSCRIPTION'] as const).map(cat => (
                            <button
                                key={cat}
                                onClick={() => {
                                    setCategoryFilter(cat);
                                    setCurrentPage(1);
                                }}
                                className={cn(
                                    "px-12 py-4 h-16 rounded-full text-[11px] font-black uppercase tracking-[0.3em] whitespace-nowrap transition-none border-none",
                                    categoryFilter === cat 
                                        ? "bg-slate-900 text-white shadow-2xl shadow-slate-900/40" 
                                        : "text-slate-400 hover:text-slate-900 hover:bg-white bg-transparent"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Terminal Feed */}
            <div className="overflow-hidden">
                <Table className="min-w-[1400px]">
                    <TableHeader className="bg-slate-50/30 border-b border-slate-50">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="w-[280px] text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 py-10 pl-16">TIMELINE_PULSE</TableHead>
                            <TableHead className="w-[260px] text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 py-10 text-center">PROTOCOL_CLASS</TableHead>
                            <TableHead className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 py-10">OPERATIONAL_TELEMETRY</TableHead>
                            {showPharmacy && (
                                <TableHead className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 py-10">NODE_ORIGIN</TableHead>
                            )}
                            <TableHead className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 py-10">AUDIT_CODE</TableHead>
                            <TableHead className="text-right text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 py-10 pr-16">FISCAL_DELTA</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedEntries.map((entry) => (
                            <React.Fragment key={entry.id}>
                                <TableRow 
                                    className={cn(
                                        "group border-slate-50 transition-none cursor-pointer",
                                        expandedRows.has(entry.id) ? "bg-slate-50/50" : "hover:bg-slate-50/30"
                                    )}
                                    onClick={() => entry.items && toggleRow(entry.id)}
                                >
                                    <TableCell className="py-12 pl-16">
                                        <div className="flex flex-col gap-4">
                                            <span className="text-[14px] font-black text-slate-900 uppercase tracking-[0.3em] tabular-nums leading-none">
                                                {format(new Date(entry.timestamp), "dd MMM yyyy").toUpperCase()}
                                            </span>
                                            <div className="flex items-center gap-4 text-[11px] font-black text-slate-300 uppercase tracking-[0.3em] leading-none">
                                                <Clock className="h-4 w-4 text-slate-100" />
                                                {format(new Date(entry.timestamp), "HH:mm:ss")}_UTC
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-12 text-center">
                                        <div className="flex justify-center">
                                            <div className={cn(
                                                "flex items-center gap-4 px-8 py-3.5 rounded-full text-[10px] font-black uppercase tracking-[0.25em] border transition-none shadow-sm",
                                                getCategoryStyles(entry.category)
                                            )}>
                                                {getCategoryIcon(entry.category)}
                                                {entry.category}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-12">
                                        <div className="flex flex-col gap-6">
                                            <div className="flex items-center gap-6">
                                                <div className="h-2 w-10 bg-brand-teal rounded-full shadow-[0_0_10px_rgba(20,184,166,0.6)]" />
                                                <span className="text-[11px] font-black text-slate-200 uppercase tracking-[0.3em] leading-none">
                                                    {entry.type.toUpperCase().replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-10">
                                                <span className="text-base font-black text-slate-900 uppercase tracking-tight leading-none max-w-[480px] truncate block group-hover:text-brand-teal transition-none">
                                                    {entry.description.toUpperCase()}
                                                </span>
                                                {entry.items && (
                                                    <div className="h-12 w-12 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-200 group-hover:text-brand-teal group-hover:border-brand-teal/20 transition-none shadow-sm">
                                                        {expandedRows.has(entry.id) ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    {showPharmacy && (
                                        <TableCell className="py-12">
                                            <div className="flex items-center gap-4 px-8 py-3.5 bg-slate-50/50 border border-slate-50 rounded-full w-fit shadow-sm group-hover:bg-slate-900 transition-colors duration-500 group-hover:border-slate-800">
                                                <Network className="h-4 w-4 text-slate-200 group-hover:text-brand-teal" />
                                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none block group-hover:text-white transition-none">
                                                    {entry.pharmacy_name?.toUpperCase() || "PLATFORM_ROOT"}
                                                </span>
                                            </div>
                                        </TableCell>
                                    )}
                                    <TableCell className="py-12">
                                        <div className="flex items-center gap-6 font-black text-[13px] text-slate-300 uppercase tracking-[0.3em] group-hover:text-slate-900 transition-none leading-none">
                                            <Terminal className="h-7 w-7 text-slate-50 group-hover:text-brand-teal transition-none" />
                                            {entry.order_code || "AUDIT_SYS"}
                                            <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 text-brand-teal transition-all" />
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-12 text-right pr-16">
                                        {entry.amount ? (
                                            <div className="flex flex-col items-end gap-4">
                                                <span className="text-xl font-black text-slate-900 tabular-nums uppercase tracking-tighter leading-none">
                                                    ₵{entry.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </span>
                                                <div className="flex items-center gap-4">
                                                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.7)]" />
                                                    <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest leading-none">Settled</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-end gap-6 text-[12px] font-black text-slate-100 uppercase tracking-[0.4em] leading-none">
                                                <div className="h-1.5 w-12 bg-slate-50 rounded-full" />
                                                NOMINAL
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                                
                                {expandedRows.has(entry.id) && entry.items && (
                                    <TableRow className="bg-slate-50/20 hover:bg-slate-50/20 border-none transition-none">
                                        <TableCell colSpan={showPharmacy ? 6 : 5} className="p-0">
                                            <div className="mx-16 mb-16 mt-6 p-16 bg-white border border-slate-100 rounded-[40px] shadow-2xl shadow-slate-900/5 overflow-hidden transition-none relative">
                                                <div className="absolute top-0 left-0 w-3 h-full bg-slate-900" />
                                                <div className="flex items-center justify-between mb-20 border-b border-slate-50 pb-12">
                                                    <div className="flex items-center gap-10">
                                                        <div className="h-20 w-20 rounded-[32px] bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-900/10">
                                                            <Activity className="h-10 w-10 text-brand-teal" />
                                                        </div>
                                                        <div className="space-y-4">
                                                            <span className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none block">Operational Stream Manifest</span>
                                                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] leading-none">Granular protocol telemetry mapping & lifecycle audit</p>
                                                        </div>
                                                    </div>
                                                    <div className="h-14 px-10 rounded-full bg-slate-900 text-brand-teal flex items-center text-[12px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-slate-900/40">
                                                        {entry.items.length} STREAMS_MAPPED
                                                    </div>
                                                </div>
                                                <div className="grid gap-8">
                                                    {entry.items.map((item: any, idx: number) => (
                                                        <div key={idx} className="flex items-center justify-between p-12 rounded-[32px] border border-slate-50 bg-slate-50/30 hover:bg-slate-50 hover:border-slate-100 transition-none group/item shadow-sm">
                                                            <div className="flex items-center gap-12">
                                                                <div className="h-20 w-20 rounded-[24px] bg-white border border-slate-100 flex items-center justify-center group-hover/item:border-brand-teal/20 transition-none shadow-sm group-hover/item:scale-105 duration-300">
                                                                    <FileText className="h-10 w-10 text-slate-200 group-hover/item:text-brand-teal transition-none" />
                                                                </div>
                                                                <div className="space-y-4">
                                                                    <span className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none block group-hover:text-brand-teal transition-none">{item.name.toUpperCase()}</span>
                                                                    <div className="flex items-center gap-6">
                                                                        <span className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em] leading-none">SKU_#{1000 + idx}</span>
                                                                        <div className="h-1 w-8 bg-slate-100 rounded-full" />
                                                                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none">INDEX_#{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-32 pr-8">
                                                                <div className="text-right space-y-4">
                                                                    <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.4em] leading-none">Payload Qty</p>
                                                                    <p className="text-xl font-black text-slate-900 tabular-nums uppercase leading-none tracking-tighter">×{item.quantity || 1}</p>
                                                                </div>
                                                                <div className="text-right min-w-[200px] space-y-4">
                                                                    <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.4em] leading-none">Unit Yield</p>
                                                                    <p className="text-xl font-black text-slate-900 tabular-nums uppercase leading-none tracking-tighter">₵{(item.price || item.price_ghs || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </React.Fragment>
                        ))}
                    </TableBody>
                </Table>
                
                {filtered.length === 0 && (
                    <div className="py-80 text-center bg-slate-50/20 border-none">
                        <div className="h-40 w-40 rounded-[48px] bg-white border border-slate-50 flex items-center justify-center mx-auto mb-16 shadow-2xl shadow-slate-900/10">
                            <ShieldAlert className="h-20 w-20 text-slate-100" />
                        </div>
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.4em] leading-none">Registry Search Nominal</h3>
                        <p className="text-[11px] font-black text-slate-200 uppercase tracking-[0.3em] mt-8 max-w-lg mx-auto leading-relaxed">
                            No protocol violations or matching operational streams detected in the current terminal search scope. Re-initialize terminal filters to refresh global registry feed.
                        </p>
                        <Button 
                            variant="outline" 
                            className="mt-16 h-20 px-20 rounded-full font-black text-[13px] uppercase tracking-[0.3em] border-none bg-slate-50/50 text-slate-300 hover:bg-slate-900 hover:text-white transition-none gap-8 shadow-2xl shadow-slate-900/5 group"
                            onClick={() => {
                                setSearchTerm("");
                                setCategoryFilter("ALL");
                            }}
                        >
                            <History className="h-6 w-6 group-hover:rotate-180 transition-transform duration-500" />
                            RESET_OPERATIONAL_AUDIT_FEED
                        </Button>
                    </div>
                )}
            </div>

            {/* Frame Control Grid */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12 pt-16 border-t border-slate-50 px-4">
                <div className="flex items-center gap-8">
                    <div className="h-3 w-3 rounded-full bg-brand-teal shadow-[0_0_12px_rgba(20,184,166,0.6)]" />
                    <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em]">
                        MATRIX_INDEX: <span className="text-slate-900">{(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filtered.length)}</span> / {filtered.length} ACTIVE_STREAMS
                    </p>
                </div>
                <div className="flex items-center gap-10">
                    <Button 
                        variant="outline" 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="h-16 px-12 rounded-full font-black text-[11px] uppercase tracking-widest border-none bg-slate-50/50 text-slate-300 hover:bg-slate-900 hover:text-white transition-none shadow-sm"
                    >
                        PREVIOUS_FRAME
                    </Button>
                    <div className="flex items-center gap-4 p-3 bg-slate-50/50 rounded-2xl border border-slate-50 shadow-sm">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const pageNum = i + 1;
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={cn(
                                        "h-12 w-12 rounded-xl text-[13px] font-black uppercase tracking-widest transition-none border-none",
                                        currentPage === pageNum 
                                            ? "bg-slate-900 text-white shadow-2xl shadow-slate-900/40" 
                                            : "text-slate-200 hover:text-slate-900 hover:bg-white bg-transparent"
                                    )}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                    </div>
                    <Button 
                        variant="outline" 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="h-16 px-12 rounded-full font-black text-[11px] uppercase tracking-widest border-none bg-slate-50/50 text-slate-300 hover:bg-slate-900 hover:text-white transition-none shadow-sm"
                    >
                        NEXT_FRAME
                    </Button>
                </div>
            </div>
        </div>
    );
}
