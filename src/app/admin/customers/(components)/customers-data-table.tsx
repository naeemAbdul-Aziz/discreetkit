/**
 * @file customers-data-table.tsx
 * @description An interactive data table for displaying customer information.
 */
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import type { Customer } from '@/lib/actions';
import { format } from 'date-fns';

export function CustomersDataTable({ customers }: { customers: Customer[] }) {

    if (customers.length === 0) {
        return (
            <Card>
                <CardContent className="p-10 text-center">
                    <p className="text-muted-foreground">No customer data available yet.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="rounded-lg">
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Email</TableHead>
                            <TableHead>First Order</TableHead>
                            <TableHead>Last Order</TableHead>
                            <TableHead className="text-right">Total Orders</TableHead>
                            <TableHead className="text-right">Total Spent (GHS)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {customers.map((customer) => (
                            <TableRow key={customer.email}>
                                <TableCell className="font-medium">{customer.email}</TableCell>
                                <TableCell>{format(new Date(customer.first_order_date), 'dd MMM yyyy')}</TableCell>
                                <TableCell>{format(new Date(customer.last_order_date), 'dd MMM yyyy')}</TableCell>
                                <TableCell className="text-right">{customer.total_orders}</TableCell>
                                <TableCell className="text-right font-mono">{customer.total_spent.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
