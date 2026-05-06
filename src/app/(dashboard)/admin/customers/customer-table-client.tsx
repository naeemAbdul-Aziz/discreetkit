"use client";

import React, { useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { badgeVariants } from '@/components/ui/badge';
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
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
        <Input 
            placeholder="Search identifier or email..." 
            value={q} 
            onChange={(e) => setQ(e.target.value)} 
            className="pl-8 bg-slate-50/50 border-none rounded-xl" 
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="border-slate-100 hover:bg-transparent">
              <TableHead className="text-[10px] uppercase font-black text-slate-400">Customer identifier</TableHead>
              <TableHead className="text-[10px] uppercase font-black text-slate-400">Activity</TableHead>
              <TableHead className="text-[10px] uppercase font-black text-slate-400">Yield (GHS)</TableHead>
              <TableHead className="text-[10px] uppercase font-black text-slate-400">Acquisition</TableHead>
              <TableHead className="text-[10px] uppercase font-black text-slate-400 text-right">Last Interaction</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => (
              <TableRow key={c.identifier} className="border-slate-50 group hover:bg-slate-50 transition-colors">
                <TableCell className="py-4">
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900">{c.email || 'Anonymous'}</span>
                        <span className="text-[10px] font-mono text-slate-400">{c.identifier}</span>
                    </div>
                </TableCell>
                <TableCell>
                    <div className={cn(badgeVariants({ variant: "outline" }), "bg-slate-100/50 border-none text-[10px] font-black")}>
                        {c.orders} ORDERS
                    </div>
                </TableCell>
                <TableCell>
                    <span className="text-sm font-black text-primary tabular-nums">
                        {c.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                </TableCell>
                <TableCell>
                    <span className="text-[10px] font-bold text-slate-500">
                        {new Date(c.firstOrder).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                </TableCell>
                <TableCell className="text-right">
                    <span className="text-[10px] font-bold text-slate-900 group-hover:text-primary transition-colors">
                        {new Date(c.lastOrder).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
