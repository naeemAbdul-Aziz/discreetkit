
'use client';

import dynamic from 'next/dynamic';
import { HeroStatic } from './(components)/hero-static';
import { ClosingCta } from './(components)/closing-cta';
import { Testimonials } from './(components)/testimonials';
import { Faq } from './(components)/faq';
import { PartnerLogos } from './(components)/partner-logos';
import { TrustStats } from './(components)/trust-stats';
import { CoverageMap } from './(components)/coverage-map';
import { WhatsInTheKit } from './(components)/whats-in-the-kit';
import { OurVision } from './(components)/our-vision';
import { HowItWorks } from './(components)/how-it-works';
import { ProductBenefits } from './(components)/product-benefits';
import { ProductSelector } from './(components)/product-selector';
import { ContactUs } from './(components)/contact-us';

const Hero = dynamic(() => import('./(components)/hero').then(mod => mod.Hero), {
    ssr: false,
    loading: () => <HeroStatic />
});


export default function Home() {
  return (
    <div className="flex flex-col">
      <Hero />
      <PartnerLogos />
      <ProductBenefits />
      <HowItWorks />
      <ProductSelector />
      <WhatsInTheKit />
      <TrustStats />
      <OurVision />
      <Testimonials />
      <CoverageMap />
      <Faq />
      <ContactUs />
      <ClosingCta />
    </div>
  );
}
