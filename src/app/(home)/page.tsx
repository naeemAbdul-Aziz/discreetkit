
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
import { ProductSelector } from './components/product-selector';
import { FeaturedFavoritesSection } from './components/featured-favorites';

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
    return products.map(p => {
      let imageUrl = p.image_url;
      // Only override images for products that exist in the database
      switch (p.id) {
        case 1:
          imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759406841/discreetkit_hiv_i3fqmu.png';
          break;
        case 2:
          imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759404957/discreetkit_pregnancy_cujiod.png';
          break;
        case 3:
          imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413735/couple_bundle_rfbpn0.png';
          break;
        case 4:
          imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759405784/postpill_jqk0n6.png';
          break;
        case 5:
          imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413220/condoms_j5qyqj.png';
          break;
        case 6:
           imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413266/lube_ysdpst.png';
           break;
        case 7:
          imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413627/weekend_bundle_t8cfxp.png';
          break;
        case 8:
          imageUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759407282/complete_bundle_gtbo9r.png';
          break;
      }
      
      return {
        ...p,
        image_url: imageUrl,
        price_ghs: Number(p.price_ghs),
        student_price_ghs: p.student_price_ghs ? Number(p.student_price_ghs) : null,
      };
    });
}

// a map to define heights for loading skeletons for a better user experience.
const componentMap = {
  PartnerLogos: { height: '200px' },
  ProductSelector: { height: '500px' },
  FeaturedFavorites: { height: '600px'},
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
const PartnerLogos = dynamic(
  () => import('./components/partner-logos').then((mod) => mod.PartnerLogos),
  { loading: () => <LoadingSkeleton height={componentMap.PartnerLogos.height} /> }
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
  
  const coupleBundle = products.find(p => p.id === 3);
  const allInOneBundle = products.find(p => p.id === 8);
  
  let featuredProducts: (Product & { stock_level: number; review_count: number; rating_avg: number; benefit: string; })[] = [];

  if (allInOneBundle && coupleBundle) {
    featuredProducts = [
      { ...allInOneBundle, stock_level: 45, review_count: 1245, rating_avg: 4.9, benefit: "Your all-in-one pack for total readiness.", image_url: "https://res.cloudinary.com/dzfa6wqb8/image/upload/v1760350373/complete_bundle_z7vti5.png" },
      { ...coupleBundle, stock_level: 8, review_count: 890, rating_avg: 4.8, benefit: "Test together for mutual support and peace of mind.", image_url: "https://res.cloudinary.com/dzfa6wqb8/image/upload/v1760350254/couple_bundle_fe87qy.png" },
    ].filter(p => p.id !== undefined) as (Product & { stock_level: number; review_count: number; rating_avg: number; benefit: string; })[];
  }
  
  return (
    <div className="flex flex-col">
      <SectionWrapper>
        <Hero />
      </SectionWrapper>

      <SectionWrapper>
        <PartnerLogos />
      </SectionWrapper>
      
      <SectionWrapper>
        <ProductSelector />
      </SectionWrapper>
      
      {featuredProducts.length > 0 && (
        <SectionWrapper className="bg-muted/50">
          <FeaturedFavoritesSection products={featuredProducts} />
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
        <Faq />
      </SectionWrapper>
      
      <SectionWrapper>
        <ContactUs />
      </SectionWrapper>

      <SectionWrapper>
        <ClosingCta />
      </SectionWrapper>
    </div>
  );
}
