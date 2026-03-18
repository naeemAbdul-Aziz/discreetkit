import type { Metadata } from 'next';
import { generateMetadata, generateBreadcrumbSchema } from '@/lib/seo';
import { StructuredData } from '@/components/seo/structured-data';

export const metadata: Metadata = generateMetadata({
  title: 'Buy Condoms Online in Ghana | DiscreetKit',
  description: 'Order premium condoms online in Ghana with 100% discreet delivery. Durex, Fiesta, Kiss, Rough Rider, and more. Fast, unbranded packaging.',
  keywords: ['buy condoms online Ghana', 'Durex condoms Ghana', 'discreet condom delivery', 'Fiesta condoms'],
  url: '/products/condoms',
});

export default function CondomsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Products', url: '/products' },
    { name: 'Condoms', url: '/products/condoms' }
  ]);

  return (
    <>
      <StructuredData data={breadcrumbSchema} includeDefaults={false} />
      {children}
    </>
  );
}
