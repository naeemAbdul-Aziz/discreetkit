"use client";

import React, { useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search, User, Activity, CreditCard, Calendar, Clock, Network, ShieldCheck, ShieldAlert, Terminal, History, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type CustomerRow = { 
    identifier: string; 
    email?: string | null; 
    totalSpent: number; 
    orders: number; 
    firstOrder: string; 
    lastOrder: string 
};

interface Props {
  initialCustomers: CustomerRow[];
}

export function CustomerTableClient({ initialCustomers }: Props) {
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return initialCustomers;
    return initialCustomers.filter(r => (
        (r.email ?? r.identifier).toLowerCase().includes(s)
    ));
  }, [initialCustomers, q]);

  return (
    <div className="space-y-12">
      <div className="relative max-w-xl group px-2">
        <Search className="absolute left-8 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-hover:text-brand-teal transition-none" />
        <Input 
            placeholder="PROTOCOL_SEARCH: FILTER_IDENTITY_REGISTRY..." 
            value={q} 
            onChange={(e) => setQ(e.target.value)} 
            className="pl-20 h-14 rounded-full font-black text-[11px] uppercase tracking-[0.2em] border-none bg-slate-50/50 shadow-sm focus-visible:ring-0 focus-visible:bg-white transition-none" 
        />
      </div>

      <div className="overflow-hidden">
        <Table className="min-w-[1000px]">
          <TableHeader className="bg-slate-50/30 border-b border-slate-50">
            <TableRow className="border-none hover:bg-transparent transition-none">
              <TableHead className="text-[10px] uppercase tracking-[0.25em] font-black text-slate-400 py-8 pl-12">MASTER_IDENTITY</TableHead>
              <TableHead className="text-[10px] uppercase tracking-[0.25em] font-black text-slate-400 py-8">OPERATIONAL_PULSE</TableHead>
              <TableHead className="text-[10px] uppercase tracking-[0.25em] font-black text-slate-400 py-8">LIQUIDITY_YIELD</TableHead>
              <TableHead className="text-[10px] uppercase tracking-[0.25em] font-black text-slate-400 py-8">INITIAL_ACQUISITION</TableHead>
              <TableHead className="text-[10px] uppercase tracking-[0.25em] font-black text-slate-400 py-8 text-right pr-12">LAST_SYNCHRONIZED</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => (
              <TableRow key={c.identifier} className="group border-slate-50 hover:bg-slate-50/30 transition-none">
                <TableCell className="py-10 pl-12">
                    <div className="flex items-center gap-6">
                        <div className="h-12 w-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-900/10">
                            <User className="h-6 w-6 text-brand-teal" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-black text-slate-900 uppercase tracking-tight leading-none">{c.email ? c.email.toUpperCase() : 'ANONYMOUS_PROTOCOL'}</span>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none tabular-nums">{c.identifier}</span>
                        </div>
                    </div>
                </TableCell>
                <TableCell className="py-10">
                    <div className="flex items-center gap-3.5 px-5 py-2.5 rounded-full bg-slate-900 shadow-2xl shadow-slate-900/20 w-fit">
                        <Activity className="h-4 w-4 text-brand-teal" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest tabular-nums">{c.orders} STREAMS_ACTIVE</span>
                    </div>
                </TableCell>
                <TableCell className="py-10">
                    <div className="h-10 px-5 rounded-full bg-slate-50 border border-slate-100 flex items-center gap-3 shadow-sm w-fit">
                        <CreditCard className="h-4 w-4 text-slate-200" />
                        <span className="text-base font-black text-slate-900 tabular-nums uppercase tracking-tighter leading-none">
                            ₵{c.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                </TableCell>
                <TableCell className="py-10">
                    <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                        <Calendar className="h-4 w-4 text-slate-200" />
                        {new Date(c.firstOrder).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase()}
                    </div>
                </TableCell>
                <TableCell className="text-right py-10 pr-12">
                    <div className="flex flex-col items-end gap-2">
                        <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest leading-none tabular-nums">
                            {new Date(c.lastOrder).toLocaleDateString(undefined, { month: 'short', day: '2-digit' }).toUpperCase()}
                        </span>
                        <div className="flex items-center gap-2 text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none tabular-nums">
                            <Clock className="h-3 w-3 text-slate-100" />
                            {new Date(c.lastOrder).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }).toUpperCase()}
                        </div>
                    </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="py-60 text-center bg-transparent border-none transition-none">
                        <div className="flex flex-col items-center gap-10">
                            <div className="h-32 w-32 rounded-3xl bg-white border border-slate-100 flex items-center justify-center shadow-2xl shadow-slate-900/5">
                                <Network className="h-16 w-16 text-slate-100" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Registry Nominal State</h3>
                                <p className="text-[11px] font-black text-slate-200 uppercase tracking-[0.25em] max-w-sm mx-auto leading-relaxed">
                                    No identities matching protocol search query. Synchronize registry telemetry to refresh identity feed.
                                </p>
                            </div>
                        </div>
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Sync Alert */}
      <div className="pt-6 border-t border-slate-50 flex items-center gap-4 px-2">
        <ShieldCheck className="h-5 w-5 text-brand-teal" />
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.25em]">Enrollee identity registry synchronized with master user matrix and terminal control.</p>
      </div>
    </div>
  );
}
