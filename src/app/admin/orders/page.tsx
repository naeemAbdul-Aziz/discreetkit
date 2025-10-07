/**
 * @file page.tsx
 * @description A placeholder page for the upcoming order management feature.
 */
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home } from 'lucide-react';
import Link from 'next/link';

export default function OrdersPage() {
    return (
        <div className="flex h-full items-center justify-center">
            <Card className="w-full max-w-md text-center p-8">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl font-bold text-foreground">
                        Order Management Coming Soon
                    </CardTitle>
                    <CardDescription className="text-base text-muted-foreground mt-4">
                        This is where you will manage all incoming orders, view details, and update statuses. We are still building this section.
                    </CardDescription>
                </CardHeader>
                <Button asChild className="mt-6">
                    <Link href="/admin/dashboard">
                        <Home />
                        Return to Dashboard
                    </Link>
                </Button>
            </Card>
        </div>
    )
}
