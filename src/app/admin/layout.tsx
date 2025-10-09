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

  if (isLoginPage) {
    return <>{children}</>;
  }

  // The middleware ensures only authenticated users can access non-login admin pages.
  // Therefore, we can safely render the shell for any page that isn't the login page.
  return (
    <AdminShell>
      {children}
    </AdminShell>
  );
}
