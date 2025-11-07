
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

const socialImageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1762356008/discreetkit_profile_photo_voqfia.png';

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
    icon: [
      { url: socialImageUrl, type: 'image/png', sizes: '16x16' },
      { url: socialImageUrl, type: 'image/png', sizes: '32x32' },
      { url: socialImageUrl, type: 'image/png', sizes: '48x48' },
      { url: socialImageUrl, type: 'image/png', sizes: '96x96' },
      { url: socialImageUrl, type: 'image/png', sizes: '192x192' },
      { url: socialImageUrl, type: 'image/png', sizes: '512x512' },
    ],
    shortcut: [socialImageUrl],
    apple: [
      { url: socialImageUrl, sizes: '180x180' },
    ],
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
      {/* Prevent iOS Safari focus zoom and improve VKB behavior */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover, interactive-widget=resizes-content" />
      <meta name="format-detection" content="telephone=no,email=no,address=no" />
         <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <link rel="mask-icon" href="https://res.cloudinary.com/dzfa6wqb8/image/upload/v1761571651/Artboard_6_oepbgq.svg" color="#187f76" />
         <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
         <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
         <link rel="preconnect" href="https://api.paystack.co" crossOrigin="anonymous" />
         <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL || ''} crossOrigin="anonymous" />
      </head>
      <body className={cn('min-h-screen bg-background font-body antialiased', fontBody.variable, fontHeadline.variable)}>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground">Skip to content</a>
        <TourProvider>
          <main id="main" role="main" className="min-h-dvh vk-safe">
            {children}
          </main>
          <Toaster />
        </TourProvider>
      </body>
    </html>
  );
}
