
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function HowItWorks() {
  return (
    <section className="bg-muted py-12 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
                <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    Transforming Customer Engagement with AI
                </h2>
                <p className="text-lg text-muted-foreground">
                    We are redefining how businesses interact, communicate, and connect with their customers. Powered by our advanced AI, we offer solutions that are both intelligent and intuitive.
                </p>
                <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start">
                        <svg className="w-5 h-5 mr-2 mt-1 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span>Our chatbot technology ensures real-time responses.</span>
                    </li>
                    <li className="flex items-start">
                        <svg className="w-5 h-5 mr-2 mt-1 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span>Design scalable tools to meet specific needs.</span>
                    </li>
                    <li className="flex items-start">
                        <svg className="w-5 h-5 mr-2 mt-1 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0_0_24_24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span>Our services work around the clock.</span>
                    </li>
                </ul>
                <Button asChild className="mt-4">
                    <Link href="/order">Get Your Free Trial</Link>
                </Button>
            </div>
            <div>
                <Image 
                    src="https://placehold.co/600x450" 
                    alt="Team working together" 
                    width={600} 
                    height={450} 
                    className="rounded-lg shadow-xl"
                    data-ai-hint="teamwork collaboration office"
                />
            </div>
        </div>
      </div>
    </section>
  );
}
