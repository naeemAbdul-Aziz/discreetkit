/**
 * @file layout.tsx
 * @description The shared layout for the admin section. It now implements a
 *              professional sidebar navigation for scalability and a better user experience.
 */

import {
  Home,
  Package,
  ShoppingCart,
  Users,
} from 'lucide-react';
import { AdminShell } from './(components)/admin-shell';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminShell
      navItems={[
        { href: '/admin/dashboard', label: 'Dashboard', icon: Home },
        { href: '/admin/products', label: 'Products', icon: Package },
        { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
        { href: '/admin/customers', label: 'Customers', icon: Users },
      ]}
    >
      {children}
    </AdminShell>
  );
}
