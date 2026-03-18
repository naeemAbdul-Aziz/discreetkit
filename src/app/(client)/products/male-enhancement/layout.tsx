import type { Metadata } from 'next';
import { generateMetadata, generateBreadcrumbSchema } from '@/lib/seo';
import { StructuredData } from '@/components/seo/structured-data';

export const metadata: Metadata = generateMetadata({
  title: 'Male Enhancement Products Ghana | DiscreetKit',
  description: 'Discreetly order male enhancement products, sprays, and supplements in Ghana. Viagra, Cialis, Kamagra, and delay sprays with fast, private delivery.',
  keywords: ['male enhancement Ghana', 'buy Viagra online Ghana', 'delay spray Ghana', 'Kamagra oral jelly', 'confidential wellness'],
  url: '/products/male-enhancement',
});

export default function MaleEnhancementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Products', url: '/products' },
    { name: 'Male Enhancement', url: '/products/male-enhancement' }
  ]);

  return (
    <>
      <StructuredData data={breadcrumbSchema} includeDefaults={false} />
      {children}
    </>
  );
}
