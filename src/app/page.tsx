
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

export default function Home() {
  return (
    <div className="flex flex-col">
      <Hero />
      <PartnerLogos />
      <ProductBenefits />
      <ProductCarousel />
      <HowItWorks />
      <Testimonials />
      <Faq />
      <ContactUs />
      <ClosingCta />
    </div>
  );
}
