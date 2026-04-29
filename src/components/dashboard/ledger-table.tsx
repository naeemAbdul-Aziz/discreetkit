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
    DollarSign, 
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
    ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { LedgerEntry, LedgerCategory } from "@/lib/admin-actions";
import { Button } from "@/components/ui/button";

interface LedgerTableProps {
    entries: LedgerEntry[];
    showPharmacy?: boolean;
}

export function LedgerTable({ entries, showPharmacy = true }: LedgerTableProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<LedgerCategory | "ALL">("ALL");
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 15;

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

    // Paginated Slicing
    const totalPages = Math.ceil(filtered.length / pageSize);
    const paginatedEntries = filtered.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const getCategoryIcon = (category: LedgerCategory) => {
        switch (category) {
            case 'FINANCE': return <DollarSign className="h-3.5 w-3.5" />;
            case 'DISPENSATION': return <Package className="h-3.5 w-3.5" />;
            case 'LOGISTICS': return <Truck className="h-3.5 w-3.5" />;
            case 'SUBSCRIPTION': return <Repeat className="h-3.5 w-3.5" />;
        }
    };

    const getCategoryStyles = (category: LedgerCategory) => {
        switch (category) {
            case 'FINANCE': return "bg-emerald-50 text-emerald-700 border-emerald-100";
            case 'DISPENSATION': return "bg-brand-indigo/5 text-brand-indigo border-brand-indigo/10";
            case 'LOGISTICS': return "bg-amber-50 text-amber-700 border-amber-100";
            case 'SUBSCRIPTION': return "bg-sky-50 text-sky-700 border-sky-100";
        }
    };

    return (
        <div className="space-y-6">
            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search by order code, pharmacy, or event..." 
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full h-10 pl-10 pr-4 bg-slate-50 border-none rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-indigo/20 transition-all"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                    {(['ALL', 'FINANCE', 'DISPENSATION', 'LOGISTICS', 'SUBSCRIPTION'] as const).map(cat => (
                        <button
                            key={cat}
                            onClick={() => {
                                setCategoryFilter(cat);
                                setCurrentPage(1); // Reset on filter
                            }}
                            className={cn(
                                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                categoryFilter === cat 
                                    ? "bg-slate-900 text-white shadow-lg shadow-slate-200" 
                                    : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="hover:bg-transparent border-slate-100">
                            <TableHead className="w-[180px] text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 py-6 pl-8">Timeline Event</TableHead>
                            <TableHead className="w-[140px] text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 py-6">Classification</TableHead>
                            <TableHead className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 py-6">Operation Ledger Record</TableHead>
                            {showPharmacy && (
                                <TableHead className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 py-6">Origin Unit</TableHead>
                            )}
                            <TableHead className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 py-6">Audit ID</TableHead>
                            <TableHead className="text-right text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 py-6 pr-8">Fiscal Value</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedEntries.map((entry) => (
                            <React.Fragment key={entry.id}>
                                <TableRow 
                                    className={cn(
                                        "group border-slate-50 transition-colors",
                                        expandedRows.has(entry.id) ? "bg-slate-50/30" : "hover:bg-slate-50/30"
                                    )}
                                    onClick={() => entry.items && toggleRow(entry.id)}
                                >
                                    <TableCell className="py-5 pl-8">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-sm font-bold text-slate-900 tabular-nums">
                                                {format(new Date(entry.timestamp), "MMM dd, yyyy")}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-tighter">
                                                <Clock className="h-3 w-3" />
                                                {format(new Date(entry.timestamp), "HH:mm:ss")}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-5">
                                        <Badge variant="outline" className={cn(
                                            "gap-1.5 rounded-lg px-2.5 py-1 text-[9px] font-black uppercase tracking-wider border-2 shadow-none",
                                            getCategoryStyles(entry.category)
                                        )}>
                                            {getCategoryIcon(entry.category)}
                                            {entry.category}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="py-5">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                                {entry.type}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-slate-700 leading-tight">
                                                    {entry.description}
                                                </span>
                                                {entry.items && (
                                                    <button className="text-brand-indigo hover:text-brand-indigo/80 p-0.5 transition-transform group-hover:scale-110">
                                                        {expandedRows.has(entry.id) ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    {showPharmacy && (
                                        <TableCell className="py-5">
                                            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                                                {entry.pharmacy_name || "Central Hub"}
                                            </span>
                                        </TableCell>
                                    )}
                                    <TableCell className="py-5">
                                        <div className="flex items-center gap-2 font-mono text-xs font-black text-slate-400 uppercase tracking-tighter">
                                            {entry.order_code || "DK-AUDIT"}
                                            <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-5 text-right pr-8">
                                        {entry.amount ? (
                                            <div className="flex flex-col items-end">
                                                <span className="text-sm font-black text-slate-900 tabular-nums">
                                                    ₵{entry.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </span>
                                                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Credit</span>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Logged</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                                
                                {/* Expanded items for dispensation */}
                                {expandedRows.has(entry.id) && entry.items && (
                                    <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-none">
                                        <TableCell colSpan={showPharmacy ? 6 : 5} className="py-0 px-8">
                                            <div className="pb-6 pt-2 animate-in slide-in-from-top-2 duration-300">
                                                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-inner">
                                                    <div className="bg-slate-50/80 px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Itemized Dispensation Details</span>
                                                        <span className="text-[9px] font-black text-brand-indigo uppercase tracking-widest">{entry.items.length} Units</span>
                                                    </div>
                                                    <div className="divide-y divide-slate-50">
                                                        {entry.items.map((item: any, idx: number) => (
                                                            <div key={idx} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50/30 transition-colors">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center">
                                                                        <FileText className="h-3.5 w-3.5 text-slate-400" />
                                                                    </div>
                                                                    <span className="text-xs font-bold text-slate-700">{item.name}</span>
                                                                </div>
                                                                <div className="flex items-center gap-6">
                                                                    <div className="text-right">
                                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Qty</p>
                                                                        <p className="text-xs font-black text-slate-900">{item.quantity || 1}</p>
                                                                    </div>
                                                                    <div className="text-right min-w-[60px]">
                                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Value</p>
                                                                        <p className="text-xs font-black text-slate-900">₵{(item.price || item.price_ghs || 0).toFixed(2)}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
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
                    <div className="py-32 text-center">
                        <div className="h-16 w-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                            <Filter className="h-8 w-8 text-slate-200" />
                        </div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">No audit records match</h3>
                        <p className="text-xs text-slate-500 font-medium mt-1">Try adjusting your filters or search query.</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} entries
                </p>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="h-9 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest border-slate-200"
                    >
                        Prev
                    </Button>
                    <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const pageNum = i + 1;
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={cn(
                                        "h-8 w-8 rounded-lg text-[10px] font-black transition-all",
                                        currentPage === pageNum 
                                            ? "bg-slate-900 text-white" 
                                            : "text-slate-400 hover:bg-slate-100"
                                    )}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                    </div>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="h-9 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest border-slate-200"
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}
