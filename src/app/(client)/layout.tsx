/**
 * @file client-layout.tsx
 * @description a client-side component to handle conditional rendering of UI elements
 *              based on the current route, resolving the 'use client' conflict with metadata.
 */
'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { FloatingShopButton } from '@/components/quick-shop-banner';
import { Chatbot } from '@/components/chatbot';
import { useEffect, useState } from 'react';

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin') || pathname.startsWith('/pharmacy') || pathname === '/login';

  // For admin pages, we render children directly without the main layout
  if (isAdminPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingShopButton />
      <Chatbot />
      <CartAnnouncer />
    </div>
  );
}

function CartAnnouncer() {
  const [message, setMessage] = useState<string | null>(null);
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { type: 'add' | 'remove'; productName?: string };
      if (!detail) return;
      const text = detail.type === 'add' ? `${detail.productName || 'Item'} added to cart` : `${detail.productName || 'Item'} removed from cart`;
      setMessage(text);
      const t = setTimeout(() => setMessage(null), 2000);
      return () => clearTimeout(t);
    };
    window.addEventListener('cart:announce', handler as EventListener);
    return () => window.removeEventListener('cart:announce', handler as EventListener);
  }, []);
  return (
    <div aria-live="polite" aria-atomic="true" className="sr-only">
      {message}
    </div>
  );
}
