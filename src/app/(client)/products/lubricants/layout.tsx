import type { Metadata } from 'next';
import { generateMetadata, generateBreadcrumbSchema } from '@/lib/seo';
import { StructuredData } from '@/components/seo/structured-data';

export const metadata: Metadata = generateMetadata({
  title: 'Personal Lubricants & Gels Ghana | DiscreetKit',
  description: 'Shop safe, water-based, and flavored lubricants online in Ghana. K-Y Jelly, Durex Play, Lubrica and more. 100% discreet packaging and delivery.',
  keywords: ['buy lube Ghana', 'personal lubricants online', 'K-Y Jelly Ghana', 'Durex Play lube', 'discreet delivery'],
  url: '/products/lubricants',
});

export default function LubricantsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Products', url: '/products' },
    { name: 'Lubricants', url: '/products/lubricants' }
  ]);

  return (
    <>
      <StructuredData data={breadcrumbSchema} includeDefaults={false} />
      {children}
    </>
  );
}
