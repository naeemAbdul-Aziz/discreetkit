
// src/app/layout.tsx
import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import { TourProvider } from '@/components/tour-provider';
import { StructuredData } from '@/components/seo/structured-data';
import { TrackingScripts } from '@/components/seo/tracking-scripts';
import { PerformanceMonitoring } from '@/components/seo/performance-monitoring';
import { generateMetadata } from '@/lib/seo';
import { 
  generateEnhancedOrganizationSchema,
  generateEnhancedWebsiteSchema,
  generateLocalBusinessSchema, 
  generateMedicalBusinessSchema,
  generateServiceSchema,
  generateMainFAQSchema
} from '@/lib/seo/advanced-schemas';
import seoConfig from '../../.seo-config.json';
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

export const metadata: Metadata = generateMetadata({
  title: seoConfig.pages.home.title,
  description: seoConfig.pages.home.description,
  keywords: seoConfig.pages.home.keywords,
});

import { MagneticCursor } from '@/components/magnetic-cursor';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Generate all enhanced structured data schemas for premium Google search results
  const organizationSchema = generateEnhancedOrganizationSchema();
  const websiteSchema = generateEnhancedWebsiteSchema();
  const localBusinessSchema = generateLocalBusinessSchema();
  const medicalBusinessSchema = generateMedicalBusinessSchema();
  const serviceSchema = generateServiceSchema();
  const faqSchema = generateMainFAQSchema();

  return (
    <html lang="en" suppressHydrationWarning>
    <head>
      {/* Prevent iOS Safari focus zoom and improve VKB behavior */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover, interactive-widget=resizes-content" />
      <meta name="format-detection" content="telephone=no,email=no,address=no" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      
      {/* Geo-targeting meta tags */}
      <meta name="geo.region" content="GH" />
      <meta name="geo.placename" content="Accra" />
      <meta name="geo.position" content="5.6037;-0.1870" />
      <meta name="ICBM" content="5.6037, -0.1870" />
      
      {/* Mobile app meta tags */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-title" content="DiscreetKit" />
      
      {/* Theme color */}
      <meta name="theme-color" content="#ffffff" />
      <meta name="msapplication-TileColor" content="#ffffff" />
      
      {/* Verification meta tags (add your verification codes) */}
      {/* <meta name="google-site-verification" content="YOUR_VERIFICATION_CODE" /> */}
      {/* <meta name="msvalidate.01" content="YOUR_BING_VERIFICATION_CODE" /> */}
      
      {/* Preconnect to external domains */}
      <link rel="mask-icon" href="https://res.cloudinary.com/dzfa6wqb8/image/upload/v1761571651/Artboard_6_oepbgq.svg" color="#187f76" />
      <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://api.paystack.co" crossOrigin="anonymous" />
      <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL || ''} crossOrigin="anonymous" />
      <link rel="preconnect" href="https://www.google-analytics.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
      
      {/* DNS prefetch for faster lookups */}
      <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      
      {/* Structured Data for Premium Google Search Results */}
      <StructuredData data={organizationSchema} />
      <StructuredData data={websiteSchema} />
      <StructuredData data={localBusinessSchema} />
      <StructuredData data={medicalBusinessSchema} />
      <StructuredData data={serviceSchema} />
      <StructuredData data={faqSchema} />
      
      {/* Tracking Scripts */}
      <TrackingScripts />
      </head>
      <body className={cn('min-h-screen bg-background font-body antialiased', fontBody.variable, fontHeadline.variable)}>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground">Skip to content</a>
        <MagneticCursor />
        <TourProvider>
          <main id="main" role="main" className="min-h-dvh vk-safe">
            {children}
          </main>
          <Toaster />
        </TourProvider>
        <PerformanceMonitoring />
      </body>
    </html>
  );
}
