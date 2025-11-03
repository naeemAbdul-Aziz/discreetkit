"use client";

/**
 * @file src/app/(dashboard)/admin/orders/page.tsx
 * @description Placeholder page for the Admin Orders section.
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSSE } from '@/hooks/use-sse';

type OrderRow = {
  id: number;
  code: string;
  status: string;
  total_price: number | null;
  created_at: string;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    params.set('limit', '50');
    if (query) params.set('q', query);
    const res = await fetch(`/api/admin/orders?${params.toString()}`, { cache: 'no-store' });
    if (res.ok) {
      const rows = await res.json();
      // Ensure numbers are numbers
      setOrders(rows.map((r: any) => ({ ...r, total_price: Number(r.total_price) })));
    } else {
      setOrders([]);
    }
  }, [query]);

  useEffect(() => {
    let timer: any;
    load();
    // Fallback polling (slow) if SSE gets disconnected
    timer = setInterval(load, 60000);
    return () => clearInterval(timer);
  }, [load]);

  // Realtime updates via SSE (orders changes)
  useSSE('/api/admin/realtime/orders', { onMessage: () => load() });

  const filtered = useMemo(() => {
    if (!orders) return null;
    const q = query.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(o => o.code.toLowerCase().includes(q) || o.status.toLowerCase().includes(q));
  }, [orders, query]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle>Orders</CardTitle>
        <div className="flex items-center gap-2">
          <Input placeholder="Search code or status" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search orders" />
          <Button variant="outline" onClick={() => setQuery('')}>Clear</Button>
        </div>
      </CardHeader>
      <CardContent>
        {!filtered && (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        )}
        {filtered && filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">No orders found.</div>
        )}
        {filtered && filtered.length > 0 && (
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total (GHS)</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>{o.code}</TableCell>
                    <TableCell className="capitalize">{o.status.replace('_', ' ')}</TableCell>
                    <TableCell>{o.total_price != null ? o.total_price.toFixed(2) : '-'}</TableCell>
                    <TableCell>{new Date(o.created_at).toLocaleString()}</TableCell>
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