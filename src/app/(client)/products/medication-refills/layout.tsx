// app/(client)/products/medication/layout.tsx
import type { Metadata } from 'next';
import { generateMetadata, generateBreadcrumbSchema } from '@/lib/seo';
import { StructuredData } from '@/components/seo/structured-data';

export const metadata: Metadata = generateMetadata({
  title: 'Emergency Contraception & Medication | DiscreetKit Ghana',
  description: 'Get emergency contraception (Postpill) and essential medications delivered discreetly. 100% confidential service with fast delivery across Ghana.',
  keywords: ['emergency contraception Ghana', 'postpill delivery', 'confidential medication', 'private pharmacy'],
  url: '/products/medication',
});

export default function MedicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Products', url: '/products' },
    { name: 'Medication', url: '/products/medication' }
  ]);

  return (
    <>
      <StructuredData data={breadcrumbSchema} includeDefaults={false} />
      {children}
    </>
  );
}