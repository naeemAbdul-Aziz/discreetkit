// app/(client)/products/layout.tsx
import type { Metadata } from 'next';
import { generateMetadata, generateBreadcrumbSchema } from '@/lib/seo';
import { StructuredData } from '@/components/seo/structured-data';

export const metadata: Metadata = generateMetadata({
  title: 'Confidential Health Products & Self-Test Kits | DiscreetKit Ghana',
  description: 'Browse our range of confidential health products including HIV self-test kits, pregnancy tests, emergency contraception, and wellness products. Discreet delivery across Ghana.',
  keywords: ['health products Ghana', 'self-test kits', 'medical supplies', 'confidential healthcare'],
  url: '/products',
});

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Products', url: '/products' }
  ]);

  return (
    <>
      <StructuredData data={breadcrumbSchema} includeDefaults={false} />
      {children}
    </>
  );
}