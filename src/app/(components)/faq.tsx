
import { faqItems } from '@/lib/data';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ChatTrigger } from '@/components/chat-trigger';

export function Faq() {
  return (
    <section id="faq" className="bg-background py-12 md:py-20">
      <div className="container mx-auto max-w-4xl px-4 md:px-6">
        <div className="text-center">
          <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Your questions, answered. If you need more info, our AI assistant is here to help.
          </p>
        </div>

        <div className="mt-8">
            <ChatTrigger />
        </div>

        <div className="mt-12">
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
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
    </section>
  );
}
