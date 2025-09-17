
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function ClosingCta() {
  return (
    <section className="py-12 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <Card className="rounded-2xl bg-primary p-8 text-center shadow-lg md:p-16">
          <h2 className="font-headline text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl">
            Your Health, Your Terms.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-primary-foreground/80">
            Ready to get started? Your <strong>peace of mind</strong> is just a few clicks away. Order your <strong>confidential health products</strong> now.
          </p>
          <div className="mt-8">
            <Button asChild size="lg" variant="accent">
              <Link href="/cart">
                Shop Securely
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
}
