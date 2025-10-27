/**
 * @file layout.tsx
 * @description the root layout for the entire application. it sets up the main html structure,
 *              loads fonts, and defines metadata. server-side logic resides here.
 */
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Chatbot } from '@/components/chatbot';
import NextTopLoader from 'nextjs-toploader';
import { TourProvider } from '@/components/tour-provider';
import { Manrope } from 'next/font/google';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { FloatingShopButton } from '@/components/quick-shop-banner';
import { Toaster } from "@/components/ui/toaster";


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


const logoUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1761571651/Artboard_2_jibbuj.svg';
const socialImageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1761571650/Artboard_1_p7j6j3.png';


let metadataBase: URL;
try {
  metadataBase = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://discreetkit.com');
} catch (e) {
  metadataBase = new URL('https://discreetkit.com');
}

// metadata for seo and social sharing.
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
      'geo',
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
        alt: 'DiscreetKit Ghana Logo',
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
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#ffffff' }, 
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontBody.variable} ${fontHeadline.variable}`}>
       <head>
          <meta name="theme-color" content="#ffffff" />
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
        <TourProvider>
           <div className="relative flex min-h-dvh flex-col bg-background">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
              <FloatingShopButton />
              <Toaster />
            </div>
        </TourProvider>
        <Chatbot />
      </body>
    </html>
  );
}
