/**
 * @file src/app/(dashboard)/layout.tsx
 * @description The root layout for the combined Admin and Pharmacy portals.
 *              It features a mobile-first, responsive design with a slide-out
 *              drawer for mobile and a persistent sidebar for desktop.
 */
import { AdminShell } from '@/components/ui/sidebar';
import { createSupabaseServerClient } from '@/lib/supabase'; // <-- Import server client
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Create a server client
  const supabase = await createSupabaseServerClient();

  // 2. Get the user
  const { data: { user } } = await supabase.auth.getUser();

  // 3. If no user, redirect to login (this is a redundant safety check)
  if (!user) {
    redirect('/login');
  }

  // 4. Pass the user to the AdminShell (so you can display email, name, etc.)
  return (
    <AdminShell user={user}> 
      {children}
    </AdminShell>
  );
}
