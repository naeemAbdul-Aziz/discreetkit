
import { Hero } from './(components)/hero';
import { FeatureGrid } from './(components)/feature-grid';
import { HowItWorks } from './(components)/how-it-works';
import { Testimonials } from './(components)/testimonials';
import { Faq } from './(components)/faq';
import { ClosingCta } from './(components)/closing-cta';
import { PartnerLogos } from './(components)/partner-logos';
import { TrustStats } from './(components)/trust-stats';
import { Separator } from '@/components/ui/separator';
import { OurVision } from './(components)/our-vision';

export default function Home() {
  return (
    <div className="flex flex-col">
      <Hero />
      <PartnerLogos />
      <TrustStats />
      <FeatureGrid />
      <HowItWorks />
      <Testimonials />
      <OurVision />
      <Separator className="my-12" />
      <Faq />
      <ClosingCta />
    </div>
  );
}
