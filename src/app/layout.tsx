
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Toaster } from "@/components/ui/toaster";
import { Chatbot } from '@/components/chatbot';
import NextTopLoader from 'nextjs-toploader';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://discreetkit.com';
const logoUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1758119851/discreetkit_logo_4_npbt4m.png';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'DiscreetKit Ghana - Confidential Health Products',
  description: 'Order confidential health products like self-test kits, emergency contraception, and more in Ghana. Anonymous, private, and discreet delivery for students and young professionals.',
  keywords: ['self-test kit', 'HIV test Ghana', 'pregnancy test Ghana', 'postpill', 'confidential testing', 'anonymous testing', 'private health test', 'discreet delivery', 'DiscreetKit'],
  openGraph: {
    type: 'website',
    url: siteUrl,
    title: 'DiscreetKit Ghana - Confidential Health Products',
    description: 'Anonymous, private, and discreet delivery of health essentials in Ghana.',
    images: [
      {
        url: logoUrl,
        width: 1200,
        height: 630,
        alt: 'DiscreetKit Ghana Logo',
      },
    ],
    siteName: 'DiscreetKit Ghana',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DiscreetKit Ghana - Confidential Health Products',
    description: 'Anonymous, private, and discreet delivery of health essentials in Ghana.',
    images: [logoUrl],
  },
  icons: {
    icon: logoUrl,
    shortcut: logoUrl,
    apple: logoUrl,
  },
};

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
          <link href="https://api.fontshare.com/v2/css?f[]=satoshi@1,900,700,500,301,701,300,501,401,901,400,2&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('min-h-screen bg-background font-body antialiased')}>
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
        </div>
        <Toaster />
      </body>
    </html>
  );
}
