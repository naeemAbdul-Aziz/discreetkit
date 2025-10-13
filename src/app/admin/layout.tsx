/**
 * @file layout.tsx
 * @description The shared layout for the admin section. It now protects all admin
 *              routes by checking for a valid session and redirecting to the
 *              login page if one does not exist.
 */
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { AdminShell } from '@/app/admin/(components)/admin-shell';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // If there is no active session, redirect the user to the login page.
  if (!session) {
    redirect('/admin/login');
  }

  // If a session exists, render the admin shell with the content.
  return (
    <AdminShell>
      {children}
    </AdminShell>
  );
}
