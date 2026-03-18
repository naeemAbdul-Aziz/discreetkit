import type { Metadata } from 'next';
import { generateMetadata, generateBreadcrumbSchema } from '@/lib/seo';
import { StructuredData } from '@/components/seo/structured-data';

export const metadata: Metadata = generateMetadata({
  title: 'Emergency Contraception (Postpill) Ghana | DiscreetKit',
  description: 'Fast, discreet delivery of emergency contraception in Ghana. Buy Postpill, Lydia, Microgynon, and Postinor-2 online with total privacy.',
  keywords: ['emergency contraception Ghana', 'buy Postpill online', 'morning after pill Ghana', 'Postinor-2 delivery', 'urgent discreet delivery'],
  url: '/products/emergency-contraceptives',
});

export default function EmergencyContraceptivesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Products', url: '/products' },
    { name: 'Emergency Contraceptives', url: '/products/emergency-contraceptives' }
  ]);

  return (
    <>
      <StructuredData data={breadcrumbSchema} includeDefaults={false} />
      {children}
    </>
  );
}
