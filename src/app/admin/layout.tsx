/**
 * @file layout.tsx
 * @description The shared layout for the admin section. It now simply renders the AdminShell
 *              unconditionally, as authentication has been removed.
 */
import { AdminShell } from '@/app/admin/(components)/admin-shell';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminShell>
      {children}
    </AdminShell>
  );
}
