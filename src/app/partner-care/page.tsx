
import { partners, faqItems } from '@/lib/data';
import { PartnerCareHeader } from './(components)/partner-care-header';
import { HospitalCard } from './(components)/hospital-card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const partnerFaqItems = [
    {
        question: "I need a confidential confirmatory test after a self-test. Who should I see?",
        answer: "For a fully confidential and professional confirmatory test, we recommend either Nyaho Medical Centre or Akai House Clinic. Both are experienced in handling these situations with discretion and care."
    },
    {
        question: "I'm looking for professional counselling about my sexual health.",
        answer: "Nyaho Medical Centre provides excellent counselling services. They offer a safe space to discuss your concerns with a professional."
    },
    {
        question: "Where can I get general health advice or other wellness products?",
        answer: "Bedita Pharmacy and Ernest Chemist are great resources for general health consultations and a wide range of wellness products. Their pharmacists can provide professional advice."
    },
    {
        question: "I have a specific concern about STIs or dermatology.",
        answer: "Akai House Clinic specializes in Sexual Health and Dermatology. They are an excellent choice for specialized care in these areas."
    }
]

export default function PartnerCarePage() {

  return (
    <div className="bg-muted">
      <div className="container mx-auto max-w-5xl px-4 py-12 md:px-6 md:py-24">
        
        <PartnerCareHeader />

        <div className="mt-12">
            <h3 className="text-2xl font-bold text-center text-foreground">Our Trusted Partners</h3>
            <p className="mt-2 text-center text-muted-foreground">Handpicked for their professionalism and discretion.</p>
        </div>

        {partners.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {partners.map((hospital) => (
              <HospitalCard key={hospital.id} hospital={hospital} />
            ))}
          </div>
        ) : (
            <div className="text-center py-16">
                <p className="text-muted-foreground">No partner hospitals are listed at this time. Please check back later.</p>
            </div>
        )}

        <div className="mt-24 max-w-3xl mx-auto">
            <div className="text-center">
                <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                    A Guide to Your Care Options
                </h2>
                <p className="mt-4 text-base text-muted-foreground">
                    Find the right support for your needs.
                </p>
            </div>
             <div className="mt-8">
                <Accordion type="single" collapsible className="w-full">
                    {partnerFaqItems.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left text-base hover:no-underline">
                        {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground">
                        {item.answer}
                        </AccordionContent>
                    </AccordionItem>
                    ))}
                </Accordion>
             </div>
        </div>

      </div>
    </div>
  );
}
