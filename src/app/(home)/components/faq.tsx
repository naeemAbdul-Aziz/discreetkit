/**
 * @file faq.tsx
 * @description displays a list of frequently asked questions in an accordion format.
 *              also includes a trigger to open the ai chatbot.
 */

import { faqItems } from '@/lib/data';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ChatTrigger } from '@/components/chat-trigger';

export function Faq() {
  return (
    <section id="faq" className="py-12 md:py-24">
      <div className="container mx-auto max-w-4xl px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Specific answers to your privacy and delivery questions.
          </p>
        </div>

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

        {/* Post-FAQ Pacely Trigger */}
        <div className="mt-16 text-center bg-background p-10 md:p-12 rounded-3xl border border-border">
          <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3">
            Still have questions?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm md:text-base leading-relaxed">
            Chat <span className="text-foreground font-medium">anonymously</span> with Pacely, our AI health assistant. No account needed, no chats saved.
          </p>
          <div className="flex justify-center">
             <ChatTrigger />
          </div>
        </div>

      </div>
    </section>
  );
}
