
import { Hero } from './(components)/hero';
import { SocialProof } from './(components)/social-proof';
import { HowItWorks } from './(components)/how-it-works';
import { ClosingCta } from './(components)/closing-cta';
import { FeatureGrid } from './(components)/feature-grid';
import { Testimonials } from './(components)/testimonials';
import { ProductBenefits } from './(components)/product-benefits';
import { Faq } from './(components)/faq';

export default function Home() {
  return (
    <div className="flex flex-col">
      <Hero />
      <SocialProof />
      <ProductBenefits />
      <FeatureGrid />
      <HowItWorks />
      <Testimonials />
      <Faq />
      <ClosingCta />
    </div>
  );
}
