// src/app/layout.tsx
import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import { TourProvider } from '@/components/tour-provider';
import './globals.css';
import { ClientLayout } from './client-layout';
import { Manrope } from 'next/font/google';
import { cn } from '@/lib/utils';

const fontBody = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
});

const fontHeadline = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-headline',
  weight: ['700', '800'],
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
          <meta name="theme-color" content="#ffffff" />
      </head>
      <body className={cn('min-h-screen bg-background font-body antialiased', fontBody.variable, fontHeadline.variable)}>
        <TourProvider>
          {children}
          <Toaster />
        </TourProvider>
      </body>
    </html>
  );
}
