/**
 * @file layout.tsx
 * @description The shared layout for the admin section. It now implements a
 *              professional sidebar navigation for scalability and a better user experience.
 */
'use client';
import { AdminShell } from '@/app/admin/(components)/admin-shell';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  // The middleware ensures only authenticated users can access admin pages.
  // We only need to differentiate to avoid showing the shell on the login page itself.
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <AdminShell>
      {children}
    </AdminShell>
  );
}
