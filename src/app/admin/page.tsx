/**
 * @file page.tsx
 * @description The root page for the /admin route. It now immediately redirects
 *              the user to the dashboard, as authentication will be handled
 *              by the layout.
 */
import { redirect } from 'next/navigation';

export default function AdminRootPage() {
    redirect('/admin/dashboard');
}
