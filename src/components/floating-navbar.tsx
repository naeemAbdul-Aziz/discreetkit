"use client";
import React, { useState } from "react";
import { HoveredLink, Menu, MenuItem, ProductItem } from "@/components/ui/navbar-menu";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { useCart } from "@/hooks/use-cart";

export function FloatingNavbar({ className }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);
  const { totalItems } = useCart();

  return (
    <div
      className={cn("fixed top-6 inset-x-0 max-w-2xl mx-auto z-50", className)}
    >
      <Menu setActive={setActive}>
        <div className="flex items-center gap-8">
            {/* Logo */}
            <Link href="/" className="font-headline font-black text-xl tracking-tighter text-emerald-500 mr-4">
                DiscreetKit.
            </Link>

            <MenuItem setActive={setActive} active={active} item="Products">
            <div className="text-sm grid grid-cols-2 gap-10 p-4">
                <ProductItem
                title="Bundles"
                href="/#products"
                src="https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759407282/complete_bundle_gtbo9r.png"
                description="Complete care kits for total peace of mind."
                />
                <ProductItem
                title="Essentials"
                href="/#products"
                src="https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413266/lube_ysdpst.png"
                description="Everyday items, delivered discreetly."
                />
                <ProductItem
                title="Test Kits"
                href="/#products"
                src="https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759406841/discreetkit_hiv_i3fqmu.png"
                description="Private screening in your own home."
                />
                <ProductItem
                title="Emergency"
                href="/#products"
                src="https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759405784/postpill_jqk0n6.png"
                description="Fast-acting solutions when you need them."
                />
            </div>
            </MenuItem>
            
            <MenuItem setActive={setActive} active={active} item="Company">
            <div className="flex flex-col space-y-4 text-sm">
                <HoveredLink href="/#how-it-works">How It Works</HoveredLink>
                <HoveredLink href="/about">About Us</HoveredLink>
            </div>
            </MenuItem>

            <MenuItem setActive={setActive} active={active} item="Support">
            <div className="flex flex-col space-y-4 text-sm">
                <HoveredLink href="/track">Track Order</HoveredLink>
                <HoveredLink href="/faq">FAQs</HoveredLink>
                <HoveredLink href="/contact">Contact Us</HoveredLink>
            </div>
            </MenuItem>

            {/* Cart Icon */}
            <Link href="/cart" className="relative p-2 rounded-full hover:bg-slate-100 transition-colors">
               <Icon name="shopping_cart" className="text-slate-600" opticalSize={24} />
               {totalItems > 0 && (
                 <span className="absolute top-0 right-0 h-4 w-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                   {totalItems}
                 </span>
               )}
            </Link>
        </div>
      </Menu>
    </div>
  );
}
