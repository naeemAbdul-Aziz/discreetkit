
import { redirect } from 'next/navigation';

/**
 * @file This page is now a server-side redirect. Since we have dedicated
 * category pages, this top-level /products route is no longer needed.
 * We redirect users to the homepage to prevent confusion.
 */
export default function ProductsRedirectPage() {
  redirect('/');
}
