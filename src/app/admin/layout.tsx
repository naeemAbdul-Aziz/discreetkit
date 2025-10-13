/**
 * @file layout.tsx
 * @description The shared layout for the admin section. It now renders the admin
 *              shell for all users, making the section publicly accessible.
 */
import { AdminShell } from '@/app/admin/(components)/admin-shell';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The session check has been removed to make the admin section public.
  return (
    <AdminShell>
      {children}
    </AdminShell>
  );
}
