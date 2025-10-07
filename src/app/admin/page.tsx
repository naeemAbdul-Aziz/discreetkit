/**
 * @file page.tsx
 * @description The root page for the /admin route. It immediately redirects
 *              the user to the login page to start the authentication flow.
 */
import { redirect } from 'next/navigation';

export default function AdminRootPage() {
    redirect('/admin/login');
}
