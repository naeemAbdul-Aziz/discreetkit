// app/(client)/products/wellness/layout.tsx
import type { Metadata } from 'next';
import { generateMetadata, generateBreadcrumbSchema } from '@/lib/seo';
import { StructuredData } from '@/components/seo/structured-data';

export const metadata: Metadata = generateMetadata({
  title: 'Wellness Products & Health Supplements | DiscreetKit Ghana',
  description: 'Shop premium wellness products and health supplements delivered discreetly to your door. Quality products for your health and wellbeing in Ghana.',
  keywords: ['wellness products Ghana', 'health supplements', 'nutrition products', 'wellness delivery'],
  url: '/products/wellness',
});

export default function WellnessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Products', url: '/products' },
    { name: 'Wellness', url: '/products/wellness' }
  ]);

  return (
    <>
      <StructuredData data={breadcrumbSchema} includeDefaults={false} />
      {children}
    </>
  );
}