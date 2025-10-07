/**
 * @file page.tsx
 * @description Page for creating a new product in the admin dashboard.
 */
import { redirect } from 'next/navigation';

// This page is obsolete because we now use a dialog for creating products.
// Redirect to the main admin products page.
export default function NewProductPage() {
    redirect('/admin/products');
}
