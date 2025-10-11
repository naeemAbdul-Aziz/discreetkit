/**
 * @file orders-data-table.tsx
 * @description An interactive data table for displaying and managing orders.
 */
'use client';

import * as React from 'react';
import { useState, useMemo, useCallback, useEffect } from 'react';
import type { Order, Pharmacy } from '@/lib/data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUpDown, Search } from 'lucide-react';
import { format } from 'date-fns';
import { InlineStatusEdit } from './inline-status-edit';
import { AssignPharmacyPopover } from './assign-pharmacy-popover';
import { getSupabaseClient } from '@/lib/supabase';

type SortableColumn = 'code' | 'created_at' | 'email' | 'total_price' | 'status' | 'pharmacy_id';
type SortDirection = 'asc' | 'desc';
const ITEMS_PER_PAGE = 15;

const SortableHeader = ({
  column,
  label,
  currentSort,
  onSort,
}: {
  column: SortableColumn;
  label: string;
  currentSort: { column: SortableColumn; direction: SortDirection };
  onSort: (column: SortableColumn) => void;
}) => (
  <TableHead onClick={() => onSort(column)} className="cursor-pointer hover:bg-muted/50">
    <div className="flex items-center gap-2">
      {label}
      {currentSort.column === column && <ArrowUpDown className="h-4 w-4" />}
    </div>
  </TableHead>
);

export function OrdersDataTable({ initialOrders, pharmacies }: { initialOrders: Order[], pharmacies: Pharmacy[] }) {
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [sort, setSort] = useState<{ column: SortableColumn, direction: SortDirection }>({ column: 'created_at', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    
    const uniqueStatuses = ['All', 'pending_payment', 'received', 'processing', 'out_for_delivery', 'completed'];

    const refreshOrders = useCallback(async () => {
        // This is now handled by the real-time subscription
    }, []);
    
    useEffect(() => {
        const supabase = getSupabaseClient();
        const channel = supabase
        .channel('public:orders')
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'orders' },
            (payload) => {
                if (payload.eventType === 'INSERT') {
                    setOrders(currentOrders => [payload.new as Order, ...currentOrders]);
                } else if (payload.eventType === 'UPDATE') {
                    setOrders(currentOrders => 
                        currentOrders.map(order => 
                            order.id === payload.new.id ? payload.new as Order : order
                        )
                    );
                } else if (payload.eventType === 'DELETE') {
                     setOrders(currentOrders => 
                        currentOrders.filter(order => order.id !== payload.old.id)
                    );
                }
            }
        )
        .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleSort = (column: SortableColumn) => {
        setCurrentPage(1);
        setSort(prevSort => ({
            column,
            direction: prevSort.column === column && prevSort.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    const filteredAndSortedOrders = useMemo(() => {
        return orders
            .filter(order =>
                (order.code.toLowerCase().includes(searchTerm.toLowerCase()) || order.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
                (statusFilter === 'All' || order.status === statusFilter)
            )
            .sort((a, b) => {
                const aValue = a[sort.column] as any;
                const bValue = b[sort.column] as any;

                if (aValue === null || bValue === null) return 0;
                
                let comparison = 0;
                if (sort.column === 'created_at') {
                    comparison = new Date(aValue).getTime() - new Date(bValue).getTime();
                } else if (typeof aValue === 'string' && typeof bValue === 'string') {
                    comparison = aValue.localeCompare(bValue);
                } else if (typeof aValue === 'number' && typeof bValue === 'number') {
                    comparison = aValue - bValue;
                } else {
                    comparison = String(aValue).localeCompare(String(bValue));
                }

                return sort.direction === 'asc' ? comparison : -comparison;
            });
    }, [orders, searchTerm, statusFilter, sort]);

    const totalPages = Math.ceil(filteredAndSortedOrders.length / ITEMS_PER_PAGE);
    const paginatedOrders = filteredAndSortedOrders.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );
    
    const renderTableBody = () => {
        if (isLoading) {
            return Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-28 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                </TableRow>
            ));
        }

        if (paginatedOrders.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        No orders found.
                    </TableCell>
                </TableRow>
            );
        }

        return paginatedOrders.map(order => (
            <TableRow key={order.id}>
                <TableCell className="font-mono">{order.code}</TableCell>
                <TableCell>{order.created_at ? format(new Date(order.created_at), 'dd MMM yyyy, h:mm a') : 'N/A'}</TableCell>
                <TableCell>{order.email}</TableCell>
                <TableCell className="font-medium">GHS {order.total_price.toFixed(2)}</TableCell>
                <TableCell>
                    <InlineStatusEdit
                        orderId={order.id}
                        currentStatus={order.status}
                        onUpdate={refreshOrders}
                    />
                </TableCell>
                 <TableCell>
                    <AssignPharmacyPopover
                        orderId={order.id}
                        currentPharmacyId={order.pharmacy_id || null}
                        pharmacies={pharmacies}
                        onUpdate={refreshOrders}
                    />
                </TableCell>
            </TableRow>
        ));
    };

    return (
        <Card className="rounded-lg">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search by code or email..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            {uniqueStatuses.map(status => (
                                <SelectItem key={status} value={status} className="capitalize">
                                    {status.replace(/_/g, ' ')}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <SortableHeader column="code" label="Order Code" currentSort={sort} onSort={handleSort} />
                            <SortableHeader column="created_at" label="Date" currentSort={sort} onSort={handleSort} />
                            <SortableHeader column="email" label="Customer" currentSort={sort} onSort={handleSort} />
                            <SortableHeader column="total_price" label="Total" currentSort={sort} onSort={handleSort} />
                            <SortableHeader column="status" label="Status" currentSort={sort} onSort={handleSort} />
                            <SortableHeader column="pharmacy_id" label="Assigned Pharmacy" currentSort={sort} onSort={handleSort} />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {renderTableBody()}
                    </TableBody>
                </Table>
            </CardContent>
             <CardFooter>
                <div className="flex items-center justify-between w-full">
                    <div className="text-xs text-muted-foreground">
                       Showing{' '}
                        <strong>
                            {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
                            {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedOrders.length)}
                        </strong>{' '}
                        of <strong>{filteredAndSortedOrders.length}</strong> orders
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            disabled={currentPage === totalPages || totalPages === 0}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
}

    