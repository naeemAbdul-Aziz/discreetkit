
import type { Metadata, Viewport } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Toaster } from "@/components/ui/toaster";
import { Chatbot } from '@/components/chatbot';
import NextTopLoader from 'nextjs-toploader';
import { SummaryBar } from '@/components/summary-bar';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://discreetkit.com';
const logoUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1757605306/discreetKIT-logo_pgf7vt.png';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'DiscreetKit Ghana - Confidential Self-Test Kits',
  description: 'Order confidential, WHO-approved self-test kits for HIV and pregnancy in Ghana. Anonymous, private, and discreet delivery for students and young professionals.',
  keywords: ['self-test kit', 'HIV test Ghana', 'pregnancy test Ghana', 'confidential testing', 'anonymous testing', 'private health test', 'discreet delivery', 'DiscreetKit'],
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
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('min-h-screen bg-background font-body antialiased', poppins.variable)}>
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
          <SummaryBar />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
