
import { Hero } from './(components)/hero';
import { SocialProof } from './(components)/social-proof';
import { HowItWorks } from './(components)/how-it-works';
import { ClosingCta } from './(components)/closing-cta';
import { ProductCarousel } from './(components)/product-carousel';
import { Testimonials } from './(components)/testimonials';
import { Faq } from './(components)/faq';
import { ContactUs } from './(components)/contact-us';
import { PartnerLogos } from './(components)/partner-logos';
import { TrustStats } from './(components)/trust-stats';
import { CoverageMap } from './(components)/coverage-map';
import { WhatsInTheKit } from './(components)/whats-in-the-kit';

export default function Home() {
  return (
    <div className="flex flex-col">
      <Hero />
      <PartnerLogos />
      <HowItWorks />
      <ProductCarousel />
      <WhatsInTheKit />
      <TrustStats />
      <Testimonials />
      <CoverageMap />
      <Faq />
      <ClosingCta />
    </div>
  );
}
