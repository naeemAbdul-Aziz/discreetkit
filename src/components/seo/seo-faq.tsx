// components/seo/seo-faq.tsx
import { generateFAQSchema } from '@/lib/seo';
import { StructuredData } from './structured-data';

interface FAQ {
  question: string;
  answer: string;
}

interface SEOFAQProps {
  faqs: FAQ[];
  className?: string;
}

export function SEOFAQ({ faqs, className = '' }: SEOFAQProps) {
  const faqSchema = generateFAQSchema(faqs);

  return (
    <div className={className}>
      <StructuredData data={faqSchema} includeDefaults={false} />
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Frequently Asked Questions</h2>
        {faqs.map((faq, index) => (
          <details key={index} className="group bg-muted/20 rounded-lg p-4">
            <summary className="cursor-pointer font-medium group-open:text-primary">
              {faq.question}
            </summary>
            <div className="mt-3 text-muted-foreground">
              {faq.answer}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

// Common FAQs for DiscreetKit
export const commonFAQs: FAQ[] = [
  {
    question: "How discreet is your delivery service?",
    answer: "We deliver in unmarked packages with no branding that reveals the contents. All deliveries are 100% confidential and anonymous. Our delivery partners are trained to be professional and discreet."
  },
  {
    question: "Do you deliver to universities in Ghana?",
    answer: "Yes! We deliver to all major universities including University of Ghana (Legon), KNUST, UCC, UPSA, GIMPA, and many others. We understand student privacy needs and provide extra discretion for campus deliveries."
  },
  {
    question: "Are your self-test kits accurate and FDA approved?",
    answer: "All our self-test kits are FDA-approved and WHO-certified. Our HIV rapid test kits have 99%+ accuracy, and pregnancy tests are 99% accurate from the first day of a missed period."
  },
  {
    question: "How quickly can I get emergency contraception (Postpill)?",
    answer: "We offer same-day delivery for emergency contraception in Accra and next-day delivery to other regions. Postpill is most effective when taken within 72 hours, so time is critical."
  },
  {
    question: "Do you require any personal information for orders?",
    answer: "We only require delivery information. No ID verification, no personal health details, and no questions asked. Your privacy is completely protected throughout the entire process."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept Mobile Money (MTN, Vodafone, AirtelTigo), bank transfers, and cash on delivery. All payments are processed securely and confidentially."
  },
  {
    question: "Can couples order testing kits together?",
    answer: "Yes! Our Partner Care service provides couple testing kits and relationship wellness products. Everything is delivered discreetly in one package for both partners."
  },
  {
    question: "What areas in Ghana do you deliver to?",
    answer: "We deliver nationwide across Ghana including Accra, Kumasi, Takoradi, Tamale, Ho, Cape Coast, and all major universities. Delivery fees vary by location, with free delivery available for orders over certain amounts."
  }
];