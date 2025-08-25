
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function ClosingCta() {
  return (
    <section className="py-12 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="rounded-lg bg-primary p-8 text-center shadow-lg md:p-12">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
            Take Control of Your Health Today
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/80">
            Ready to get started? Your peace of mind is just a few clicks away. Order your confidential self-test kit now.
          </p>
          <div className="mt-8">
            <Button asChild size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
              <Link href="/order">Order Your Test Kit Securely</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
