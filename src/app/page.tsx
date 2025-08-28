
'use client';

import { Hero } from './(components)/hero';
import { ClosingCta } from './(components)/closing-cta';
import { Testimonials } from './(components)/testimonials';
import { Faq } from './(components)/faq';
import { PartnerLogos } from './(components)/partner-logos';
import { TrustStats } from './(components)/trust-stats';
import { CoverageMap } from './(components)/coverage-map';
import { WhatsInTheKit } from './(components)/whats-in-the-kit';
import { OurVision } from './(components/our-vision';
import { ProductSelector } from './(components)/product-selector';
import { SummaryBar } from '@/components/summary-bar';
import { HowItWorks } from './(components)/how-it-works';

export default function Home() {
  return (
    <div className="flex flex-col">
      <Hero />
      <PartnerLogos />
      <HowItWorks />
      <ProductSelector />
      <WhatsInTheKit />
      <TrustStats />
      <OurVision />
      <Testimonials />
      <CoverageMap />
      <Faq />
      <ClosingCta />
      <SummaryBar />
    </div>
  );
}
