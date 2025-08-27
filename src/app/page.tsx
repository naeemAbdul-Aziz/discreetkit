
'use client';

import { useState } from 'react';
import { Hero } from './(components)/hero';
import { SocialProof } from './(components)/social-proof';
import { ClosingCta } from './(components)/closing-cta';
import { ProductCarousel } from './(components)/product-carousel';
import { Testimonials } from './(components)/testimonials';
import { Faq } from './(components)/faq';
import { PartnerLogos } from './(components)/partner-logos';
import { TrustStats } from './(components)/trust-stats';
import { CoverageMap } from './(components/coverage-map';
import { WhatsInTheKit } from './(components)/whats-in-the-kit';
import { FloatingProgress } from './(components)/floating-progress';
import { StepSection } from './(components)/step-section';
import { steps } from '@/lib/data';
import { OurVision } from './(components)/our-vision';

export default function Home() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="flex flex-col">
      <Hero />
      <PartnerLogos />
      
      <div className="relative">
        <FloatingProgress activeStep={activeStep} />
        <div className="container mx-auto max-w-5xl px-4 md:px-6 relative z-10">
          <div className="text-center my-12 md:my-24">
            <h2 className="mt-2 font-headline text-2xl font-bold text-foreground md:text-3xl">
              A Responsible Path to Your Health Answers
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-base text-muted-foreground">
              Get your results in 4 simple, private, and secure steps.
            </p>
          </div>
          <div className="flex flex-col gap-16 md:gap-32">
            {steps.map((step, index) => (
              <StepSection
                key={step.number}
                step={step}
                index={index}
                onVisible={() => setActiveStep(index)}
              />
            ))}
          </div>
        </div>
      </div>

      <ProductCarousel />
      <WhatsInTheKit />
      <TrustStats />
      <OurVision />
      <Testimonials />
      <CoverageMap />
      <Faq />
      <ClosingCta />
    </div>
  );
}
