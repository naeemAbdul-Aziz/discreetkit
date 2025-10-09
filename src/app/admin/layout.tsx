/**
 * @file layout.tsx
 * @description The shared layout for the admin section. It now implements a
 *              professional sidebar navigation for scalability and a better user experience.
 */
'use client';
import { AdminShell } from '@/app/admin/(components)/admin-shell';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // The middleware should handle redirection, but this is a fallback.
    // We can also return the login page directly if it's a child.
    // For pages other than login, this prevents dashboard flashing.
    return <>{children}</>;
  }

  return (
    <AdminShell>
      {children}
    </AdminShell>
  );
}
