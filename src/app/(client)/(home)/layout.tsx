// app/(client)/(home)/layout.tsx
import type { Metadata } from 'next';
import { generateMetadata, generateFAQSchema } from '@/lib/seo';
import { faqItems } from '@/lib/data';
import { SEOContent, seoContentBlocks, localSEOContent } from '@/components/seo/seo-content';
import { StructuredData } from '@/components/seo/structured-data';

export const metadata: Metadata = generateMetadata({
  title: 'DiscreetKit Ghana: Confidential Health Products Delivered',
  description: 'Order confidential self-test kits for HIV, pregnancy, and wellness products. 100% private, anonymous delivery across Ghana. Skip the awkward - we deliver discreetly to universities and homes.',
  keywords: ['discreet health products', 'confidential self-test kits', 'Ghana medical delivery', 'university health services'],
  url: '/',
});

interface HomeLayoutProps {
  children: React.ReactNode;
}

export default function HomeLayout({ children }: HomeLayoutProps) {
  return (
    <>
      {/* Main page content */}
      {children}
      
      {/* SEO Enhancement: FAQ Schema (Hidden) */}
      <StructuredData 
        data={generateFAQSchema(faqItems.slice(0, 6))} 
        includeDefaults={false} 
      />

      {/* SEO Enhancement: Hidden content for better keyword targeting */}
      <SEOContent 
        title={seoContentBlocks.hivTesting.title}
        content={seoContentBlocks.hivTesting.content}
      />
      <SEOContent 
        title={seoContentBlocks.pregnancyTesting.title}
        content={seoContentBlocks.pregnancyTesting.content}
      />
      <SEOContent 
        title={seoContentBlocks.emergencyContraception.title}
        content={seoContentBlocks.emergencyContraception.content}
      />
      <SEOContent 
        title={seoContentBlocks.studentHealth.title}
        content={seoContentBlocks.studentHealth.content}
      />
      <SEOContent 
        title={localSEOContent.accra.title}
        content={localSEOContent.accra.content}
      />
      <SEOContent 
        title={localSEOContent.kumasi.title}
        content={localSEOContent.kumasi.content}
      />
    </>
  );
}