/**
 * @file page.tsx
 * @description the main entry point for the homepage. it fetches product data
 *              and dynamically loads all the sections that make up the page.
 */

import dynamic from 'next/dynamic';
import { Hero } from './components/hero';
import { ClosingCta } from './components/closing-cta';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { getSupabaseClient } from '@/lib/supabase';
import type { Product } from '@/lib/data';
import { ProductFeature } from './components/product-feature';

// fetches all products from the supabase database.
async function getProducts(): Promise<Product[]> {
    const supabase = getSupabaseClient();
    const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true });

    if (error) {
        console.error("error fetching products:", error);
        return [];
    }
    // ensure numeric types are correctly cast from what might be strings in the db.
    return products.map(p => ({
      ...p,
      price_ghs: Number(p.price_ghs),
      student_price_ghs: p.student_price_ghs ? Number(p.student_price_ghs) : null,
      savings_ghs: p.savings_ghs ? Number(p.savings_ghs) : null,
    }));
}

// a map to define heights for loading skeletons for a better user experience.
const componentMap = {
  ProductSelector: { height: '700px' },
  ProductBenefits: { height: '100px' },
  HowItWorks: { height: '800px' },
  OurVision: { height: '800px' },
  Testimonials: { height: '500px' },
  Faq: { height: '600px' },
  ContactUs: { height: '600px' },
  PartnerReferral: { height: '500px' },
};

// a generic loading skeleton component.
const LoadingSkeleton = ({ height }: { height: string }) => (
  <div className="container mx-auto px-4 md:px-6 py-12 md:py-24">
    <Skeleton className="w-full" style={{ height }} />
  </div>
);

// dynamically import components to enable code splitting and improve performance.
// this means components are only loaded when they are needed.
const ProductSelector = dynamic(
  () => import('./components/product-selector').then((mod) => mod.ProductSelector as any),
  { loading: () => <LoadingSkeleton height={componentMap.ProductSelector.height} /> }
);
const ProductBenefits = dynamic(
  () => import('./components/product-benefits').then((mod) => mod.ProductBenefits),
  { loading: () => <LoadingSkeleton height={componentMap.ProductBenefits.height} /> }
);
const HowItWorks = dynamic(
  () => import('./components/how-it-works').then((mod) => mod.HowItWorks),
  { loading: () => <LoadingSkeleton height={componentMap.HowItWorks.height} /> }
);
const OurVision = dynamic(
  () => import('./components/our-vision').then((mod) => mod.OurVision),
  { loading: () => <LoadingSkeleton height={componentMap.OurVision.height} /> }
);
const Testimonials = dynamic(
  () => import('./components/testimonials').then((mod) => mod.Testimonials),
  { loading: () => <LoadingSkeleton height={componentMap.Testimonials.height} /> }
);
const Faq = dynamic(
  () => import('./components/faq').then((mod) => mod.Faq),
  { loading: () => <LoadingSkeleton height={componentMap.Faq.height} /> }
);
const ContactUs = dynamic(
  () => import('./components/contact-us').then((mod) => mod.ContactUs),
  { loading: () => <LoadingSkeleton height={componentMap.ContactUs.height} /> }
);

// a wrapper component to provide consistent styling for page sections.
const SectionWrapper: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn('bg-background', className)}>
    {children}
  </div>
);

export default async function Home() {
  // fetch product data on the server.
  const products = await getProducts();
  const coupleBundle = products.find(p => p.id === 3); // Support Bundle (Couple)
  const allInOneBundle = products.find(p => p.id === 8); // The All-In-One
  const pregnancyTest = products.find(p => p.id === 2);
  const postpill = products.find(p => p.id === 4);
  
  if (allInOneBundle) {
      allInOneBundle.image_url = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759403673/bundle_qwaywe.png';
  }

  if (pregnancyTest) {
    pregnancyTest.image_url = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759404957/discreetkit_pregnancy_cujiod.png';
  }

  if (postpill) {
    postpill.image_url = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759405784/postpill_jqk0n6.png';
  }


  return (
    <div className="flex flex-col">
      <SectionWrapper>
        <Hero />
      </SectionWrapper>
      
      <SectionWrapper>
        <ProductSelector products={products} />
      </SectionWrapper>
      
      {coupleBundle && (
          <SectionWrapper>
              <ProductFeature product={coupleBundle} />
          </SectionWrapper>
      )}

      {allInOneBundle && (
           <SectionWrapper>
              <ProductFeature product={allInOneBundle} reverse={true} />
          </SectionWrapper>
      )}

      <SectionWrapper className="bg-primary">
        <ProductBenefits />
      </SectionWrapper>

      <SectionWrapper>
        <HowItWorks />
      </SectionWrapper>
      
      <SectionWrapper>
        <OurVision />
      </SectionWrapper>

      <SectionWrapper>
        <Testimonials />
      </SectionWrapper>
      
      <SectionWrapper>
        <ClosingCta />
      </SectionWrapper>
      
      <SectionWrapper>
        <Faq />
      </SectionWrapper>
      
      <SectionWrapper>
        <ContactUs />
      </SectionWrapper>
    </div>
  );
}
