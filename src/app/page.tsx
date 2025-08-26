
import { Hero } from './(components)/hero';
import { SocialProof } from './(components)/social-proof';
import { HowItWorks } from './(components)/how-it-works';
import { ClosingCta } from './(components)/closing-cta';
import { ProductCarousel } from './(components)/product-carousel';
import { Testimonials } from './(components)/testimonials';
import { ProductBenefits } from './(components)/product-benefits';
import { Faq } from './(components)/faq';
import { ContactUs } from './(components)/contact-us';
import { PartnerLogos } from './(components)/partner-logos';
import { OurVision } from './(components)/our-vision';
import { TrustStats } from './(components)/trust-stats';
import { CoverageMap } from './(components)/coverage-map';

export default function Home() {
  return (
    <div className="flex flex-col">
      <Hero />
      <TrustStats />
      <HowItWorks />
      <ProductCarousel />
      <OurVision />
      <Testimonials />
      <CoverageMap />
      <Faq />
      <ClosingCta />
    </div>
  );
}
