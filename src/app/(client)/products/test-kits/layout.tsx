// app/(client)/products/test-kits/layout.tsx
import type { Metadata } from 'next';
import { generateMetadata, generateBreadcrumbSchema } from '@/lib/seo';
import { StructuredData } from '@/components/seo/structured-data';

export const metadata: Metadata = generateMetadata({
  title: 'Self-Test Kits: HIV, Pregnancy & More | DiscreetKit Ghana',
  description: 'Order FDA-approved self-test kits for HIV, pregnancy, and other health conditions. Get accurate, private results at home with discreet delivery across Ghana.',
  keywords: ['HIV self-test Ghana', 'pregnancy test kit', 'at-home medical testing', 'confidential health screening'],
  url: '/products/test-kits',
});

export default function TestKitsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Products', url: '/products' },
    { name: 'Self-Test Kits', url: '/products/test-kits' }
  ]);

  return (
    <>
      <StructuredData data={breadcrumbSchema} includeDefaults={false} />
      {children}
    </>
  );
}