/**
 * @file footer.tsx
 * @description The main site footer, redesigned for a clean, centered, and elegant aesthetic.
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Fragment } from 'react';
import { Facebook, Instagram, Twitter } from 'lucide-react';

const socialLinks = [
  { href: '#', icon: Twitter, 'aria-label': 'Twitter' },
  { href: '#', icon: Instagram, 'aria-label': 'Instagram' },
  { href: '#', icon: Facebook, 'aria-label': 'Facebook' },
];

export function Footer() {
  const nav = [
    { href: '/products', label: 'Products' },
    { href: '/partner-care', label: 'Partner Care' },
    { href: '/track', label: 'Track' },
    { href: '/#faq', label: 'FAQ' },
    { href: '/privacy', label: 'Privacy' },
  ];

  const Logo = () => (
    <Image
        src="https://res.cloudinary.com/dzfa6wqb8/image/upload/v1762345271/Artboard_2_3_fvyg9i.png"
        alt="DiscreetKit Logo"
        width={140}
        height={32}
        style={{ height: 'auto', width: 'auto' }}
    />
  );

  return (
    <footer className="border-t bg-card text-card-foreground">
      <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        <div className="flex flex-col items-center justify-center gap-8">
          
          {/* Logo */}
          <Link href="/" aria-label="DiscreetKit Homepage">
            <Logo />
          </Link>

          {/* Navigation Links */}
          <nav aria-label="Footer">
            <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {nav.map((item, index) => (
                <Fragment key={item.href}>
                  <li>
                    <Link
                      href={item.href}
                      className="transition-colors hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  </li>
                  {index < nav.length - 1 && (
                     <li className="text-muted-foreground/50" aria-hidden="true">&bull;</li>
                  )}
                </Fragment>
              ))}
            </ul>
          </nav>
          
          {/* Social Links */}
           <div className="flex items-center justify-center gap-4">
            {socialLinks.map((social) => (
              <Link
                key={social['aria-label']}
                href={social.href}
                aria-label={social['aria-label']}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <social.icon className="h-4 w-4" />
              </Link>
            ))}
          </div>

          {/* Tagline */}
          <p className="italic text-muted-foreground">
            skip the awkward.
          </p>
          
          {/* Copyright */}
          <p className="text-center text-xs text-muted-foreground/80">
            &copy; {new Date().getFullYear()} Access DiscreetKit Ltd. All rights reserved.
          </p>

        </div>
      </div>
    </footer>
  );
}
