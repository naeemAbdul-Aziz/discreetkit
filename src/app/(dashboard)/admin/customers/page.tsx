"use client";

/**
 * @file src/app/(dashboard)/admin/customers/page.tsx
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useMemo, useState } from 'react';
import { useSSE } from '@/hooks/use-sse';
import { Input } from '@/components/ui/input';

type CustomerRow = { identifier: string; email?: string | null; totalSpent: number; orders: number; firstOrder: string; lastOrder: string };

export default function AdminCustomersPage() {
  const [rows, setRows] = useState<CustomerRow[] | null>(null);
  const [q, setQ] = useState('');

  useEffect(() => {
    let timer: any;
    const load = async () => {
      const res = await fetch('/api/admin/customers', { cache: 'no-store' });
      if (res.ok) setRows(await res.json()); else setRows([]);
    };
    load();
    timer = setInterval(load, 60000);
    return () => clearInterval(timer);
  }, []);

  // Realtime: customers derive from orders; listen to customers SSE (orders under the hood)
  useSSE('/api/admin/realtime/customers', { onMessage: () => {
    fetch('/api/admin/customers', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(json => json && setRows(json))
      .catch(() => {});
  }});

  const filtered = useMemo(() => {
    if (!rows) return null;
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(r => ((r.email ?? r.identifier).toLowerCase().includes(s)));
  }, [rows, q]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Customers</CardTitle>
          <CardDescription>Manage customer data and view order history.</CardDescription>
        </div>
        <Input placeholder="Search by email…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
      </CardHeader>
      <CardContent>
        {!filtered ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Total Spent (GHS)</TableHead>
                  <TableHead>First Order</TableHead>
                  <TableHead>Last Order</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.identifier}>
                    <TableCell className="font-medium">{c.email ?? c.identifier}</TableCell>
                    <TableCell>{c.orders}</TableCell>
                    <TableCell>{c.totalSpent.toFixed(2)}</TableCell>
                    <TableCell>{new Date(c.firstOrder).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(c.lastOrder).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}