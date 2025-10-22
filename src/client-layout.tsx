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
import { Toaster } from "@/components/ui/toaster";

export function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  // For admin pages, we render children directly without the main layout
  if (isAdminPage) {
    return <>{children}</>;
  }

  return (
    <div className="relative flex min-h-dvh flex-col bg-background">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingShopButton />
      {/* The Toaster is now here, so it only renders on non-admin pages */}
      <Toaster />
    </div>
  );
}
