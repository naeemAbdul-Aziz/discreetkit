/**
 * @file page.tsx
 * @description The login page for the admin dashboard. It contains the
 *              login form and handles user authentication.
 */
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { LoginForm } from './(components)/login-form';
import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function LoginPageContents() {
    return (
        <Card className="w-full max-w-sm">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">DiscreetKit Admin</CardTitle>
                <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
                <LoginForm />
            </CardContent>
        </Card>
    );
}

export default async function LoginPage() {
    const session = await getSession();
    if (session) {
        redirect('/admin/dashboard');
    }

    return (
        <div className="flex min-h-dvh w-full items-center justify-center bg-muted p-4">
            <Suspense fallback={<div>Loading...</div>}>
                <LoginPageContents />
            </Suspense>
        </div>
    )
}
