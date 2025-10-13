/**
 * @file page.tsx
 * @description The login page for the admin dashboard. It displays a full-screen
 *              login form and handles user authentication.
 */
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { LoginForm } from './(components)/login-form';
import { Suspense } from 'react';

export default async function LoginPage() {
    const session = await getSession();

    // If a session already exists, redirect the user to the dashboard.
    if (session) {
        redirect('/admin/dashboard');
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted p-4">
            <Suspense fallback={<div className="h-96 w-full max-w-sm animate-pulse rounded-lg bg-card" />}>
                <LoginForm />
            </Suspense>
        </div>
    );
}
