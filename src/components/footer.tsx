/**
 * @file footer.tsx
 * @description the main site footer, including navigation links, social media,
 *              and branding. it's responsive and provides key information.
 */

'use client';

import Link from 'next/link';
import { Twitter, Instagram, Facebook } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

// Custom SVG for Snapchat
const SnapchatIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M14.5 2H9.5a1 1 0 0 0-1 1v4.5a.5.5 0 0 0 .5.5h6a.5.5 0 0 0 .5-.5V3a1 1 0 0 0-1-1Z" />
      <path d="M12 12.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z" />
      <path d="M12 2v2.5" />
      <path d="M12 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
    </svg>
  );
  
// Custom SVG for WhatsApp
const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
    </svg>
);

// Custom SVG for TikTok
const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
        <path d="M16 8h-2a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
        <path d="M12 12V8" />
    </svg>
);


export function Footer() {
  const footerLinks = {
    company: [
      { href: '/#how-it-works', label: 'How It Works' },
      { href: '/partner-care', label: 'Our Partners' },
      { href: '/#faq', label: 'FAQ' },
      { href: '/#contact', label: 'Contact Us' },
      { href: '/admin', label: 'Admin' },
    ],
    legal: [
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/terms', label: 'Terms of Service' },
    ],
  };

  const socialLinks = [
      { href: 'https://x.com/discreetkit', icon: Twitter, label: 'Twitter' },
      { href: 'https://instagram.com/discreetkit', icon: Instagram, label: 'Instagram' },
      { href: 'https://tiktok.com/@discreetkit', icon: TikTokIcon, label: 'TikTok' },
      { href: 'https://facebook.com/discreetkit', icon: Facebook, label: 'Facebook' },
      { href: 'https://wa.me/233556561081', icon: WhatsAppIcon, label: 'WhatsApp' },
      { href: 'https://snapchat.com/add/discreetkit', icon: SnapchatIcon, label: 'Snapchat' },
  ]

  const Logo = () => (
    <span className="font-headline text-2xl font-bold tracking-tight text-primary-foreground">
        DiscreetKit
    </span>
);

  return (
    <footer className="border-t bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12 md:px-6">
        <div className="grid gap-8 md:grid-cols-12">
          {/* Brand Section */}
          <div className="md:col-span-4">
            <Link href="/" className="mb-4 inline-flex items-center space-x-2">
              <Logo />
            </Link>
            <p className="max-w-xs text-sm text-primary-foreground/80">
              Private health answers, delivered with trust. Confidential, reliable self-test kits in Ghana.
            </p>
          </div>

          {/* Links Sections */}
          <div className="grid grid-cols-2 gap-8 md:col-span-5 md:col-start-8">
            <div>
              <h3 className="mb-4 font-semibold tracking-wider text-primary-foreground">Company</h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-primary-foreground/80 transition-colors hover:text-primary-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold tracking-wider text-primary-foreground">Legal</h3>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-primary-foreground/80 transition-colors hover:text-primary-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between border-t border-primary-foreground/20 pt-8 sm:flex-row">
          <p className="text-sm text-primary-foreground/80">
            &copy; {new Date().getFullYear()} Access DiscreetKit Ltd. All rights reserved.
          </p>
          <div className="mt-4 flex items-center space-x-2 sm:mt-0">
             {socialLinks.map((link) => (
                <Button key={link.label} asChild variant="ghost" size="icon" className="text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground">
                    <Link href={link.href} target="_blank" rel="noopener noreferrer">
                        <link.icon className="h-5 w-5" />
                        <span className="sr-only">{link.label}</span>
                    </Link>
                </Button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
