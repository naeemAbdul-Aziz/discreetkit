/**
 * @file layout.tsx
 * @description The shared layout for the admin section. It now implements a
 *              professional sidebar navigation for scalability and a better user experience.
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
