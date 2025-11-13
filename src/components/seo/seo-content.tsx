// components/seo/seo-content.tsx
interface SEOContentProps {
  title: string;
  content: string;
  className?: string;
}

// Hidden SEO content for better keyword targeting
export function SEOContent({ title, content, className = '' }: SEOContentProps) {
  return (
    <div className={`sr-only ${className}`} aria-hidden="true">
      <h2>{title}</h2>
      <p>{content}</p>
    </div>
  );
}

// Pre-defined SEO content blocks for DiscreetKit
export const seoContentBlocks = {
  hivTesting: {
    title: "HIV Self-Testing in Ghana - Private and Accurate",
    content: "Get FDA-approved HIV rapid test kits delivered discreetly across Ghana. Our HIV self-test kits provide 99%+ accurate results in 15-20 minutes from the comfort and privacy of your home. No clinic visits, no awkward conversations - just reliable, confidential HIV testing with same-day delivery in Accra and next-day delivery nationwide. Perfect for University of Ghana students, KNUST students, and anyone seeking private HIV testing in Ghana."
  },
  pregnancyTesting: {
    title: "Private Pregnancy Testing - Confidential Results at Home",
    content: "Order pregnancy test kits with completely anonymous delivery across Ghana. Our pregnancy tests are 99% accurate from the first day of a missed period and provide clear, easy-to-read results. No pharmacy visits required - get confidential pregnancy testing delivered discreetly to your door in Accra, Kumasi, and all major cities in Ghana."
  },
  emergencyContraception: {
    title: "Emergency Contraception (Postpill) - Fast Anonymous Delivery",
    content: "Get emergency contraception (Postpill) delivered urgently across Ghana. Same-day delivery available in Accra, next-day delivery nationwide. Our emergency contraception is most effective when taken within 72 hours, so we ensure the fastest possible anonymous delivery. No prescriptions needed, no questions asked - just reliable emergency contraception when you need it most."
  },
  studentHealth: {
    title: "University Health Services - Discreet Delivery to Campus",
    content: "Specialized health services for students at University of Ghana (Legon), KNUST, UCC, UPSA, GIMPA, and all major universities in Ghana. We understand student privacy needs and provide extra-discreet delivery directly to hostels and campus locations. Student discounts available on all health products including HIV tests, pregnancy tests, emergency contraception, and wellness products."
  },
  couplesCare: {
    title: "Couples Health and Relationship Wellness in Ghana",
    content: "Partner Care services providing confidential health products for couples across Ghana. Order couple testing kits, relationship wellness products, and intimate health supplies with completely discreet delivery. Support your relationship with private health resources delivered anonymously to your door."
  }
};

// Local SEO content for Ghana
export const localSEOContent = {
  accra: {
    title: "Health Products Delivery in Accra - Same Day Service",
    content: "Fast, same-day delivery of confidential health products across Accra including East Legon, Cantonments, Airport Residential, Tema, Kasoa, and surrounding areas. Serving University of Ghana (Legon) students with specialized campus delivery services."
  },
  kumasi: {
    title: "Confidential Health Delivery in Kumasi - KNUST Campus Service", 
    content: "Discreet delivery of health products throughout Kumasi and Ashanti Region. Specialized services for KNUST students and Kumasi residents with next-day delivery and student discounts on all confidential health products."
  },
  cape_coast: {
    title: "Health Products Delivery in Cape Coast - UCC Campus",
    content: "Confidential health product delivery to Cape Coast and Central Region. Serving University of Cape Coast (UCC) students and residents with discreet delivery of HIV tests, pregnancy tests, and emergency contraception."
  }
};