
import { Hero } from './(components)/hero';
import { SocialProof } from './(components)/social-proof';
import { HowItWorks } from './(components)/how-it-works';
import { ClosingCta } from './(components)/closing-cta';
import { ProductCarousel } from './(components)/product-carousel';
import { Testimonials } from './(components)/testimonials';
import { ProductBenefits } from './(components)/product-benefits';
import { Faq } from './(components)/faq';

export default function Home() {
  return (
    <div className="flex flex-col">
      <Hero />
      <SocialProof />
      <ProductBenefits />
      <ProductCarousel />
      <HowItWorks />
      <Testimonials />
      <Faq />
      <ClosingCta />
    </div>
  );
}
