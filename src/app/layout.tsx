
import type { Metadata } from 'next';
import { Figtree } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Toaster } from "@/components/ui/toaster";
import { Chatbot } from '@/components/chatbot';
import NextTopLoader from 'nextjs-toploader';

const figtree = Figtree({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-figtree',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://discreetkit.com';
const logoUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1756391917/discreetKit_tvvwkr.png';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'DiscreetKit Ghana - Confidential Self-Test Kits',
  description: 'Order confidential, WHO-approved self-test kits for HIV and pregnancy in Ghana. Anonymous, private, and discreet delivery for students and young professionals.',
  keywords: ['self-test kit', 'HIV test Ghana', 'pregnancy test Ghana', 'confidential testing', 'anonymous testing', 'private health test', 'discreet delivery', 'DiscreetKit'],
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
  openGraph: {
    type: 'website',
    url: siteUrl,
    title: 'DiscreetKit Ghana - Confidential Self-Test Kits',
    description: 'Anonymous, private, and discreet self-test kit delivery in Ghana.',
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
    title: 'DiscreetKit Ghana - Confidential Self-Test Kits',
    description: 'Anonymous, private, and discreet self-test kit delivery in Ghana.',
    images: [logoUrl],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
       <head>
      </head>
      <body className={cn('min-h-screen bg-background font-body antialiased', figtree.variable)}>
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
