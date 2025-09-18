
import Link from 'next/link';
import { ShieldCheck, Twitter, Instagram, Facebook } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

export function Footer() {
  const footerLinks = {
    company: [
      { href: '/#how-it-works', label: 'How It Works' },
      { href: '/partners', label: 'Our Partners' },
      { href: '/#faq', label: 'FAQ' },
      { href: '/#contact', label: 'Contact Us' },
    ],
    legal: [
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/terms', label: 'Terms of Service' },
    ],
  };

  const socialLinks = [
      { href: '#', icon: Twitter, label: 'Twitter' },
      { href: '#', icon: Instagram, label: 'Instagram' },
      { href: '#', icon: Facebook, label: 'Facebook' },
  ]

  const logoUrl = 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1758119851/discreetkit_logo_4_npbt4m.png';

  return (
    <footer className="border-t bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12 md:px-6">
        <div className="grid gap-8 md:grid-cols-12">
          {/* Brand Section */}
          <div className="md:col-span-4">
            <Link href="/" className="mb-4 inline-flex items-center space-x-2">
              <Image 
                src={logoUrl} 
                alt="DiscreetKit Logo" 
                width={160} 
                height={40} 
                className="brightness-0 invert h-auto w-auto"
              />
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
            &copy; {new Date().getFullYear()} DiscreetKit Ghana. All rights reserved.
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
