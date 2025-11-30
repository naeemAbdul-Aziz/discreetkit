'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Twitter, Instagram, Facebook } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getStoreSettings } from '@/lib/admin-actions';

const socialLinks = [
  { href: '#', icon: Twitter, label: 'Twitter' },
  { href: '#', icon: Instagram, label: 'Instagram' },
  { href: '#', icon: Facebook, label: 'Facebook' },
];

const footerNav = [
  {
    title: 'Shop',
    links: [
      { href: '/products', label: 'All Products' },
      { href: '/products/test-kits', label: 'Test Kits' },
      { href: '/products/bundles', label: 'Bundles' },
      { href: '/track', label: 'Track Order' },
    ]
  },
  {
    title: 'Support',
    links: [
      { href: '/partner-care', label: 'Customer Care' },
      { href: '/partner-with-us', label: 'Partner With Us' },
    ]
  },
  {
    title: 'Legal',
    links: [
      { href: '/terms', label: 'Terms of Service' },
      { href: '/privacy', label: 'Privacy Policy' },
    ]
  }
];

export function Footer() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    getStoreSettings().then(setSettings).catch(console.error);
  }, []);

  const email = settings?.support_email || 'support@discreetkit.com';
  const storeName = settings?.store_name || 'DiscreetKit Ghana';
  const [firstName, ...rest] = storeName.split(' ');
  const lastName = rest.join(' ') || 'Kit';

  return (
    <footer className="bg-muted/30 text-foreground pt-12 pb-8 md:pt-24 md:pb-12 overflow-hidden border-t border-border">
      <div className="container mx-auto px-6">
        
        {/* Massive Headline */}
        <div className="mb-12 md:mb-24 border-b border-border pb-8 md:pb-12">
          <h2 className="font-headline text-3xl md:text-6xl font-black tracking-tight uppercase">
            {firstName}<span className="text-primary">{lastName}</span>.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 mb-12 md:mb-24">
          
          {/* Brand Column */}
          <div className="md:col-span-4">
            <p className="text-lg md:text-2xl font-medium leading-relaxed max-w-sm mb-6 md:mb-8">
              The modern standard for private health delivery. Skip the awkward, stay supported.
            </p>
            <div className="mb-6 md:mb-8 text-muted-foreground">
                <p>Need help? Email us at:</p>
                <a href={`mailto:${email}`} className="text-foreground hover:text-primary transition-colors">{email}</a>
            </div>
            <div className="flex gap-4">
               {socialLinks.map((social) => (
                 <Link 
                   key={social.label} 
                   href={social.href}
                   className="h-10 w-10 md:h-12 md:w-12 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                 >
                   <social.icon className="w-4 h-4 md:w-5 md:h-5" />
                 </Link>
               ))}
            </div>
          </div>

          {/* Navigation Grid */}
          <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
            {footerNav.map((section) => (
              <div key={section.title}>
                <h3 className="font-bold text-base md:text-lg mb-4 md:mb-6 text-muted-foreground">{section.title}</h3>
                <ul className="space-y-3 md:space-y-4">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="group flex items-center text-base md:text-lg hover:text-primary transition-colors">
                        {link.label}
                        <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 ml-1 opacity-0 -translate-y-1 translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end pt-6 md:pt-8 border-t border-border text-muted-foreground text-xs md:text-sm">
           <p>&copy; {new Date().getFullYear()} {settings?.store_name || 'Access DiscreetKit Ltd.'}</p>
           <p className="mt-2 md:mt-0">Designed with precision in Accra.</p>
        </div>

      </div>
    </footer>
  );
}
