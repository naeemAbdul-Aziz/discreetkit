/**
 * @file layout.tsx
 * @description the root layout for the entire application. it sets up the main html structure,
 *              loads fonts, defines metadata, and wraps pages with the header and footer.
 */

import type { Metadata, Viewport } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Toaster } from "@/components/ui/toaster";
import { Chatbot } from '@/components/chatbot';
import NextTopLoader from 'nextjs-toploader';
import { StickyShopLink } from '@/components/sticky-shop-link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://discreetkit.com';
const logoUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1758119851/discreetkit_logo_4_npbt4m.png';

// metadata for seo and social sharing.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'DiscreetKit Ghana: Confidential Health Products Delivered',
    template: '%s | DiscreetKit Ghana',
  },
  description: 'Order confidential self-test kits for HIV, pregnancy, and more. Get Postpill and wellness products delivered discreetly to your door in Ghana. 100% private, anonymous, and secure.',
  keywords: [
      'DiscreetKit', 
      'self-test kit Ghana', 
      'at-home HIV test', 
      'private pregnancy test', 
      'emergency contraception Ghana', 
      'Postpill delivery', 
      'confidential health products', 
      'anonymous testing Accra', 
      'student health services', 
      'UG Legon delivery', 
      'UPSA health',
      'discreet delivery',
      'sexual health Ghana'
  ],
  openGraph: {
    type: 'website',
    url: siteUrl,
    title: 'DiscreetKit Ghana: Confidential Health Products Delivered',
    description: '100% private, anonymous, and secure delivery of self-test kits and wellness products in Ghana.',
    images: [
      {
        url: logoUrl,
        width: 1200,
        height: 630,
        alt: 'DiscreetKit Ghana Logo over a discreet package',
      },
    ],
    siteName: 'DiscreetKit Ghana',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DiscreetKit Ghana: Confidential Health Products Delivered',
    description: '100% private, anonymous, and secure delivery of self-test kits and wellness products in Ghana.',
    images: [logoUrl],
  },
  icons: {
    icon: logoUrl,
    shortcut: logoUrl,
    apple: logoUrl,
  },
};

// viewport settings for responsive design.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
       <head>
          {/* load the 'satoshi' font from fontshare. */}
          <link href="https://api.fontshare.com/v2/css?f[]=satoshi@1,900,700,500,301,701,300,501,401,901,400,2&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('min-h-screen bg-background font-body antialiased')}>
        {/* top loading bar for page transitions. */}
        <NextTopLoader
          color="hsl(var(--primary))"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px hsl(var(--primary)),0 0 5px hsl(var(--primary))"
        />
        <div className="relative flex min-h-dvh flex-col bg-background">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <Chatbot />
          <StickyShopLink />
        </div>
        {/* toaster for displaying notifications. */}
        <Toaster />
      </body>
    </html>
  );
}
