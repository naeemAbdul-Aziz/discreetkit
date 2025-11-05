
// src/app/layout.tsx
import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import { TourProvider } from '@/components/tour-provider';
import './globals.css';
import localFont from 'next/font/local';
import { cn } from '@/lib/utils';

const fontBody = localFont({
  src: [
    { path: './fonts/Satoshi-Variable.woff2', weight: '100 900', style: 'normal' },
  ],
  variable: '--font-body',
  display: 'swap',
  fallback: ['system-ui', 'Segoe UI', 'Arial'],
});

const fontHeadline = localFont({
  src: [
    { path: './fonts/Satoshi-Variable.woff2', weight: '700 900', style: 'normal' },
  ],
  variable: '--font-headline',
  display: 'swap',
  fallback: ['system-ui', 'Segoe UI', 'Arial'],
});

const socialImageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1761571650/Artboard_1_p7j6j3.png';

let metadataBase: URL;
try {
  metadataBase = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://discreetkit.com');
} catch (e) {
  metadataBase = new URL('https://discreetkit.com');
}

export const metadata: Metadata = {
  metadataBase,
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
    url: '/',
    title: 'DiscreetKit Ghana: Confidential Health Products Delivered',
    description: '100% private, anonymous, and secure delivery of self-test kits and wellness products in Ghana.',
    images: [
      {
        url: socialImageUrl,
        width: 1200,
        height: 630,
        alt: 'DiscreetKit Ghana - Skip the Awkward',
      },
    ],
    siteName: 'DiscreetKit Ghana',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DiscreetKit Ghana: Confidential Health Products Delivered',
    description: '100% private, anonymous, and secure delivery of self-test kits and wellness products in Ghana.',
    images: [socialImageUrl],
  },
  icons: {
    icon: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1761573359/Artboard_3_b2vstg.svg',
    shortcut: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1761573359/Artboard_3_b2vstg.png',
    apple: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1761573359/Artboard_3_b2vstg.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
         <meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff" />
         <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#1c2121" />
         <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
         <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
         <link rel="preconnect" href="https://api.paystack.co" crossOrigin="anonymous" />
         <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL || ''} crossOrigin="anonymous" />
      </head>
      <body className={cn('min-h-screen bg-background font-body antialiased', fontBody.variable, fontHeadline.variable)}>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground">Skip to content</a>
        <TourProvider>
          <main id="main" role="main">
            {children}
          </main>
          <Toaster />
        </TourProvider>
      </body>
    </html>
  );
}
