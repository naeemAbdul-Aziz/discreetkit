
import dynamic from 'next/dynamic';
import { Hero } from './(components)/hero';
import { ClosingCta } from './(components)/closing-cta';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

const componentMap = {
  ProductSelector: { height: '700px' },
  ProductBenefits: { height: '100px' },
  HowItWorks: { height: '800px' },
  WhatsInTheKit: { height: '500px' },
  TrustStats: { height: '600px' },
  OurVision: { height: '800px' },
  Testimonials: { height: '500px' },
  CoverageMap: { height: '600px' },
  Faq: { height: '600px' },
  ContactUs: { height: '600px' },
};

const LoadingSkeleton = ({ height }: { height: string }) => (
  <div className="container mx-auto px-4 md:px-6 py-12 md:py-24">
    <Skeleton className="w-full" style={{ height }} />
  </div>
);

const ProductSelector = dynamic(
  () => import('./(components)/product-selector').then((mod) => mod.ProductSelector),
  { loading: () => <LoadingSkeleton height={componentMap.ProductSelector.height} /> }
);
const ProductBenefits = dynamic(
  () => import('./(components)/product-benefits').then((mod) => mod.ProductBenefits),
  { loading: () => <LoadingSkeleton height={componentMap.ProductBenefits.height} /> }
);
const HowItWorks = dynamic(
  () => import('./(components)/how-it-works').then((mod) => mod.HowItWorks),
  { loading: () => <LoadingSkeleton height={componentMap.HowItWorks.height} /> }
);
const WhatsInTheKit = dynamic(
  () => import('./(components)/whats-in-the-kit').then((mod) => mod.WhatsInTheKit),
  { loading: () => <LoadingSkeleton height={componentMap.WhatsInTheKit.height} /> }
);
const TrustStats = dynamic(
  () => import('./(components)/trust-stats').then((mod) => mod.TrustStats),
  { loading: () => <LoadingSkeleton height={componentMap.TrustStats.height} /> }
);
const OurVision = dynamic(
  () => import('./(components)/our-vision').then((mod) => mod.OurVision),
  { loading: () => <LoadingSkeleton height={componentMap.OurVision.height} /> }
);
const Testimonials = dynamic(
  () => import('./(components)/testimonials').then((mod) => mod.Testimonials),
  { loading: () => <LoadingSkeleton height={componentMap.Testimonials.height} /> }
);
const CoverageMap = dynamic(
  () => import('./(components)/coverage-map').then((mod) => mod.CoverageMap),
  { loading: () => <LoadingSkeleton height={componentMap.CoverageMap.height} /> }
);
const Faq = dynamic(
  () => import('./(components)/faq').then((mod) => mod.Faq),
  { loading: () => <LoadingSkeleton height={componentMap.Faq.height} /> }
);
const ContactUs = dynamic(
  () => import('./(components)/contact-us').then((mod) => mod.ContactUs),
  { loading: () => <LoadingSkeleton height={componentMap.ContactUs.height} /> }
);

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const SectionWrapper: React.FC<SectionWrapperProps> = ({ children, className }) => (
  <div className={cn(className)}>
    {children}
  </div>
);

export default function Home() {
  return (
    <div className="flex flex-col">
      <SectionWrapper className="bg-background">
        <Hero />
      </SectionWrapper>
      
      <SectionWrapper className="bg-background">
        <ProductSelector />
      </SectionWrapper>

      <SectionWrapper className="bg-primary">
        <ProductBenefits />
      </SectionWrapper>

      <SectionWrapper className="bg-muted">
        <HowItWorks />
      </SectionWrapper>

      <SectionWrapper className="bg-background">
        <WhatsInTheKit />
      </SectionWrapper>

      <SectionWrapper className="bg-muted">
        <TrustStats />
      </SectionWrapper>
      
      <SectionWrapper className="bg-background">
        <OurVision />
      </SectionWrapper>
      
      <SectionWrapper className="bg-muted">
        <Testimonials />
      </SectionWrapper>
      
      <SectionWrapper className="bg-background">
        <div className="py-12 md:py-24">
            <div className="container mx-auto px-4 md:px-6">
                <Card className="p-0 overflow-hidden">
                    <ClosingCta />
                </Card>
            </div>
        </div>
      </SectionWrapper>

      <SectionWrapper className="bg-muted">
        <CoverageMap />
      </SectionWrapper>
      
      <SectionWrapper className="bg-background">
        <Faq />
      </SectionWrapper>
      
      <SectionWrapper className="bg-muted">
        <ContactUs />
      </SectionWrapper>
    </div>
  );
}
