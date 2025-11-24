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
      { href: '/products/test-kits', label: 'Test Kits' },
      { href: '/products/bundles', label: 'Bundles' },
      { href: '/products/wellness', label: 'Wellness' },
      { href: '/products/medication', label: 'Medication' },
    ]
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About Us' },
      { href: '/partner-care', label: 'Partner Care' },
      { href: '/careers', label: 'Careers' },
      { href: '/contact', label: 'Contact' },
    ]
  },
  {
    title: 'Support',
    links: [
      { href: '/track', label: 'Track Order' },
      { href: '/#faq', label: 'FAQ' },
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/terms', label: 'Terms of Service' },
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
    <footer className="bg-foreground text-background pt-24 pb-12 overflow-hidden">
      <div className="container mx-auto px-6">
        
        {/* Massive Headline */}
        <div className="mb-24 border-b border-white/10 pb-12">
          <h2 className="font-headline text-4xl md:text-6xl font-black tracking-tight uppercase opacity-90">
            {firstName}<span className="text-primary">{lastName}</span>.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-24">
          
          {/* Brand Column */}
          <div className="md:col-span-4">
            <p className="text-xl md:text-2xl font-medium leading-relaxed max-w-sm mb-8">
              The modern standard for private health delivery. Skip the awkward, stay supported.
            </p>
            <div className="mb-8 text-white/60">
                <p>Need help? Email us at:</p>
                <a href={`mailto:${email}`} className="text-white hover:text-primary transition-colors">{email}</a>
            </div>
            <div className="flex gap-4">
               {socialLinks.map((social) => (
                 <Link 
                   key={social.label} 
                   href={social.href}
                   className="h-12 w-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-colors"
                 >
                   <social.icon className="w-5 h-5" />
                 </Link>
               ))}
            </div>
          </div>

          {/* Navigation Grid */}
          <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-12">
            {footerNav.map((section) => (
              <div key={section.title}>
                <h3 className="font-bold text-lg mb-6 text-white/40">{section.title}</h3>
                <ul className="space-y-4">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="group flex items-center text-lg hover:text-primary transition-colors">
                        {link.label}
                        <ArrowUpRight className="w-4 h-4 ml-1 opacity-0 -translate-y-1 translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-end pt-8 border-t border-white/10 opacity-40 text-sm">
           <p>&copy; {new Date().getFullYear()} {settings?.store_name || 'Access DiscreetKit Ltd.'}</p>
           <p className="mt-2 md:mt-0">Designed with precision in Accra.</p>
        </div>

      </div>
    </footer>
  );
}
