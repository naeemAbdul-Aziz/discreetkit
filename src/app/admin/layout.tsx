/**
 * @file layout.tsx
 * @description The shared layout for the admin section. It now implements a
 *              professional sidebar navigation for scalability and a better user experience.
 */
import { AdminShell } from '@/app/admin/(components)/admin-shell';
import { cookies } from 'next/headers';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hasSession = cookies().has('session');

  // The middleware ensures only authenticated users can access admin pages.
  // We only need to differentiate to avoid showing the shell on the login page itself.
  if (!hasSession) {
    return <>{children}</>;
  }

  return (
    <AdminShell>
      {children}
    </AdminShell>
  );
}
