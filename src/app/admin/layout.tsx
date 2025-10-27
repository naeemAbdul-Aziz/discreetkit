/**
 * @file layout.tsx
 * @description The root layout for the admin section. It includes a session check
 *              to protect all admin routes and wraps pages in the AdminShell.
 */
import { AdminShell } from './(components)/admin-shell';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // If there's no valid session, redirect the user to the login page.
  if (!session) {
    redirect('/admin/login');
  }

  // If the session is valid, render the admin shell with the page content.
  return <AdminShell>{children}</AdminShell>;
}
