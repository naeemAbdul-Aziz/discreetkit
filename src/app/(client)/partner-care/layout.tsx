// app/(client)/partner-care/layout.tsx
import type { Metadata } from 'next';
import { generateMetadata, generateBreadcrumbSchema } from '@/lib/seo';
import { StructuredData } from '@/components/seo/structured-data';

export const metadata: Metadata = generateMetadata({
  title: 'Partner Care Services | DiscreetKit Ghana',
  description: 'Supporting relationships with confidential health resources, couple testing kits, and wellness products. Discreet delivery for you and your partner across Ghana.',
  keywords: ['couple health testing', 'relationship wellness', 'partner care Ghana', 'confidential couple services'],
  url: '/partner-care',
});

export default function PartnerCareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Partner Care', url: '/partner-care' }
  ]);

  return (
    <>
      <StructuredData data={breadcrumbSchema} includeDefaults={false} />
      {children}
    </>
  );
}