
'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

/**
 * @file This page is now a client-side redirect. Since we have dedicated
 * category pages, this top-level /products route is no longer needed.
 * We redirect users to the homepage to prevent confusion.
 */
export default function ProductsRedirectPage() {
  useEffect(() => {
    redirect('/');
  }, []);

  return null;
}
