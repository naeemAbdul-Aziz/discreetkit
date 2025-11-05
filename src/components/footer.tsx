/**
 * @file footer.tsx
 * @description the main site footer, including navigation links, social media,
 *              and branding. it's responsive and provides key information.
 */

'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

// No social clutter; keep footer minimal and focused on essentials.


export function Footer() {
  const nav = [
    { href: '/products', label: 'Products' },
    { href: '/partner-care', label: 'Partner Care' },
    { href: '/track', label: 'Track' },
    { href: '/privacy', label: 'Privacy' },
    { href: '/terms', label: 'Terms' },
  ];

  const Logo = () => (
    <span className="font-headline text-2xl font-bold tracking-tight text-primary-foreground">
        DiscreetKit
    </span>
);

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-10 md:px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <Link href="/" className="inline-flex items-center space-x-2" aria-label="DiscreetKit Homepage">
            <span className="font-headline text-xl font-bold tracking-tight text-foreground">DiscreetKit</span>
          </Link>

          <nav aria-label="Footer">
            <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="rounded-full px-2 py-1 transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-6 border-t pt-6">
          <p className="text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Access DiscreetKit Ltd.
          </p>
        </div>
      </div>
    </footer>
  );
}
