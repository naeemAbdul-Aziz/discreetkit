"use client";

/**
 * @file src/app/(dashboard)/admin/products/page.tsx
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useMemo, useState } from 'react';
import { useSSE } from '@/hooks/use-sse';
import { Input } from '@/components/ui/input';

type ProductRow = { id: number; name: string; category: string | null; brand: string | null; price_ghs: number; stock_level: number; created_at: string; featured?: boolean };

export default function AdminProductsPage() {
  const [rows, setRows] = useState<ProductRow[] | null>(null);
  const [q, setQ] = useState('');

  useEffect(() => {
    let timer: any;
    const load = async () => {
      const res = await fetch('/api/admin/products', { cache: 'no-store' });
      if (res.ok) setRows(await res.json()); else setRows([]);
    };
    load();
    timer = setInterval(load, 60000);
    return () => clearInterval(timer);
  }, []);

  // Realtime: update when products change
  useSSE('/api/admin/realtime/products', { onMessage: () => {
    fetch('/api/admin/products', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(json => json && setRows(json))
      .catch(() => {});
  }});

  const filtered = useMemo(() => {
    if (!rows) return null;
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(r => r.name.toLowerCase().includes(s) || (r.category || '').toLowerCase().includes(s) || (r.brand || '').toLowerCase().includes(s));
  }, [rows, q]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Products</CardTitle>
          <CardDescription>Manage your product inventory.</CardDescription>
        </div>
        <Input placeholder="Search products…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
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
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.category || '-'}</TableCell>
                    <TableCell>{p.brand || '-'}</TableCell>
                    <TableCell>GHS {Number(p.price_ghs).toFixed(2)}</TableCell>
                    <TableCell>{p.stock_level}</TableCell>
                    <TableCell>{new Date(p.created_at).toLocaleDateString()}</TableCell>
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