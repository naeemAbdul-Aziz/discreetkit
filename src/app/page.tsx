
import { Hero } from './(components)/hero';
import { FeatureGrid } from './(components)/feature-grid';
import { HowItWorks } from './(components)/how-it-works';
import { Testimonials } from './(components)/testimonials';
import { Faq } from './(components)/faq';
import { ClosingCta } from './(components)/closing-cta';
import { Separator } from '@/components/ui/separator';
import { PartnerLogos } from './(components)/partner-logos';

export default function Home() {
  return (
    <div className="flex flex-col">
      <Hero />
      <PartnerLogos />
      <FeatureGrid />
      <HowItWorks />
      <Testimonials />
      <div className="container mx-auto px-4 md:px-6">
        <Separator className="my-12 md:my-20" />
      </div>
      <Faq />
      <ClosingCta />
    </div>
  );
}

