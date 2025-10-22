/**
 * @file layout.tsx
 * @description The shared layout for the admin section. It now renders the admin
 *              shell for all users, making the section publicly accessible.
 */
import { AdminShell } from '@/app/admin/(components)/admin-shell';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect('/admin/login');
  }

  return (
    <AdminShell>
      {children}
    </AdminShell>
  );
}
