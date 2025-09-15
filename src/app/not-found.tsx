
'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

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


export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100dvh-10rem)] items-center justify-center bg-background p-4 text-center">
      <div className="flex flex-col items-center">
        <Image
          src="https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=600&h=450&fit=crop&q=75"
          alt="An empty delivery box, symbolizing a page not found."
          width={400}
          height={300}
          className="max-w-xs object-contain"
          data-ai-hint="empty box"
          placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(400, 300))}`}
        />
        <h1 className="mt-8 font-headline text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
          Whoops! Nothing Here.
        </h1>
        <p className="mt-4 max-w-md text-base text-muted-foreground">
          It looks like the page you're searching for is as empty as this box. Maybe it was never here, or perhaps it's on a little adventure.
        </p>
        <Button asChild className="mt-8" size="lg">
          <Link href="/">
            Return to Homepage
            <ArrowRight />
          </Link>
        </Button>
      </div>
    </div>
  );
}
