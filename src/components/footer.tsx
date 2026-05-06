"use client";

import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import { useEffect, useState } from "react";
import { getStoreSettings } from "@/lib/admin-actions";

const socialLinks = [
  { href: "#", icon: "public", label: "Twitter" },
  { href: "#", icon: "photo_camera", label: "Instagram" },
  { href: "#", icon: "groups", label: "Facebook" },
];

const footerNav = [
  {
    title: "Shop",
    links: [
      { href: "/products", label: "All Products" },
      { href: "/products/test-kits", label: "Test Kits" },
      { href: "/products/bundles", label: "Bundles" },
      { href: "/track", label: "Track Order" },
    ],
  },
  {
    title: "Support",
    links: [{ href: "/partner-care", label: "Customer Care" }],
  },
  {
    title: "Legal",
    links: [
      { href: "/terms", label: "Terms of Service" },
      { href: "/privacy", label: "Privacy Policy" },
    ],
  },
];

export function Footer() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    getStoreSettings().then(setSettings).catch(console.error);
  }, []);

  const email = settings?.support_email || "hello@discreetkit.com";
  const storeName = settings?.store_name || "DiscreetKit Ghana";
  const [firstName, ...rest] = storeName.split(" ");
  const lastName = rest.join(" ") || "Kit";

  return (
    <footer className="bg-muted/30 text-foreground pt-10 pb-6 md:pt-16 md:pb-10 overflow-hidden border-t border-border">
      <div className="container mx-auto px-6">
        {/* Massive Headline */}
        {/* Massive Headline Removed */}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 mb-8 md:mb-12">
          {/* Brand Column */}
          <div className="md:col-span-4">
            <p className="text-base md:text-xl font-medium leading-relaxed max-w-sm mb-4 md:mb-6">
              The modern standard for private health delivery. Skip the awkward,
              stay supported.
            </p>
            <div className="mb-6 md:mb-8 text-muted-foreground">
              <p>Need help? Email us at:</p>
              <a
                href={`mailto:${email}`}
                className="text-foreground hover:text-primary transition-colors"
              >
                {email}
              </a>
            </div>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  className="h-9 w-9 md:h-10 md:w-10 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                >
                  <Icon name={social.icon} className="w-4 h-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Navigation Grid */}
          <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
            {footerNav.map((section) => (
              <div key={section.title}>
                <h3 className="font-bold text-base md:text-lg mb-4 md:mb-6 text-muted-foreground">
                  {section.title}
                </h3>
                <ul className="space-y-2 md:space-y-3">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="group flex items-center text-sm md:text-base hover:text-primary transition-colors"
                      >
                        {link.label}
                        <Icon name="north_east" className="w-3.5 h-3.5 ml-1 opacity-0 -translate-y-1 translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0" />
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
          <p>
            &copy; {new Date().getFullYear()}{" "}
            {settings?.store_name || "Access DiscreetKit Ltd."}
          </p>
          <p className="mt-2 md:mt-0"></p>
        </div>
      </div>
    </footer>
  );
}
