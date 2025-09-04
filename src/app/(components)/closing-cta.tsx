
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#f0f0f0" offset="20%" />
      <stop stop-color="#e0e0e0" offset="50%" />
      <stop stop-color="#f0f0f0" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#f0f0f0" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str);


export function ClosingCta() {
  return (
    <section className="py-12 md:py-24 bg-muted">
      <div className="container mx-auto px-4 md:px-6">
        <div className="rounded-2xl bg-primary overflow-hidden shadow-lg">
            <div className="grid md:grid-cols-2 items-center">
                <div className="p-8 md:p-12 text-center md:text-left">
                    <h2 className="font-headline text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl">
                        Your Health, Your Terms.
                    </h2>
                    <p className="mx-auto mt-4 max-w-xl text-base text-primary-foreground/80">
                        Ready to get started? Your <strong>peace of mind</strong> is just a few clicks away. Order your <strong>confidential self-test kit</strong> now.
                    </p>
                    <div className="mt-8">
                        <Button asChild size="lg" variant="accent">
                        <Link href="/cart">
                            Order Your Test Kit Securely
                            <ArrowRight />
                        </Link>
                        </Button>
                    </div>
                </div>
                <div className="relative h-64 md:h-full w-full">
                     <Image
                        src="https://images.unsplash.com/photo-1579684385127-6ac149463259?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxyZWxpZXZlZCUyMHBlcnNvbnxlbnwwfHx8fDE3NTYzOTU5OTR8MA&ixlib=rb-4.1.0&q=80&w=1080"
                        alt="A person looking relieved and happy"
                        fill
                        className="object-cover"
                        data-ai-hint="relieved person"
                        placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(600, 400))}`}
                     />
                </div>
            </div>
        </div>
      </div>
    </section>
  );
}
