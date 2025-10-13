/**
 * @file page.tsx
 * @description The root page for the /admin route. It now redirects to the
 *              admin dashboard, as the login page is no longer the entry point.
 */
import { redirect } from 'next/navigation';

export default function AdminRootPage() {
    redirect('/admin/dashboard');
}
