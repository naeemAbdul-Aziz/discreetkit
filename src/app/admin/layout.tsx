/**
 * @file layout.tsx
 * @description The shared layout for the admin section. It now implements a
 *              professional sidebar navigation for scalability and a better user experience.
 */
'use client';
import { AdminShell } from '@/app/admin/(components)/admin-shell';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();

  // On the login page, we never show the shell, regardless of auth state.
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // For all other admin pages, we first wait for auth check to complete.
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If authenticated, show the shell with the page content.
  if (isAuthenticated) {
    return (
      <AdminShell>
        {children}
      </AdminShell>
    );
  }

  // If not authenticated, middleware will redirect to login.
  // Returning null here prevents flashing of un-styled content.
  return null;
}
