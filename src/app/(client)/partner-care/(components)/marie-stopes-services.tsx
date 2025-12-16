"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { marieStopesData } from '@/lib/data';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export function MarieStopesServices() {
  const [copied, setCopied] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'Sexual Health' | 'Reproductive Health' | 'General Wellness'>('Sexual Health');
  const code = "DK-MS-2024"; // Unique Code

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const categories = ['Sexual Health', 'Reproductive Health', 'General Wellness'] as const;
  const filteredServices = marieStopesData.services.filter(s => s.category === activeCategory);

  return (
    <div className="w-full max-w-5xl mx-auto">
        {/* Unique Access Code Section */}
        <div className="mb-16 flex flex-col items-center text-center">
            <h2 className="text-3xl font-bold font-headline mb-4">Your Discreet Access Code</h2>
            <p className="text-muted-foreground max-w-lg mb-8">
                Skip the appointment booking. Simply present this verified code at any Marie Stopes centre to access priority, confidential care as a DiscreetKit partner.
            </p>

            <div className="relative group">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative flex items-center gap-4 bg-card border border-primary/20 rounded-2xl p-2 pl-6 shadow-sm hover:shadow-md transition-all">
                    <span className="font-mono text-2xl font-bold tracking-wider text-primary">{code}</span>
                    <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={handleCopy}
                        className={cn(
                            "h-12 w-12 rounded-xl transition-all",
                            copied ? "bg-green-500/10 text-green-600 hover:bg-green-500/20" : "hover:bg-primary/10 hover:text-primary"
                        )}
                    >
                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </Button>
                </div>
            </div>
            {copied && <p className="text-xs text-green-600 font-medium mt-3 animate-in fade-in slide-in-from-top-1">Code copied to clipboard</p>}
        </div>

        {/* Categories Tab */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map((cat) => (
                <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                        "px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border",
                        activeCategory === cat 
                            ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                            : "bg-transparent text-muted-foreground border-transparent hover:bg-secondary/50"
                    )}
                >
                    {cat}
                </button>
            ))}
        </div>

        {/* Services Grid */}
        <div className="bg-secondary/30 rounded-[2.5rem] p-6 md:p-10 border border-border/50">
            <AnimatePresence mode="wait">
                <motion.div 
                    key={activeCategory}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {filteredServices.map((service, index) => (
                        <Card key={index} className="border-none shadow-none bg-background/80 hover:bg-background transition-colors">
                            <CardContent className="p-6">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                    <Info className="w-5 h-5 text-primary" />
                                </div>
                                <h3 className="font-bold text-lg mb-2">{service.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </motion.div>
            </AnimatePresence>
            
            <div className="mt-8 text-center">
                 <p className="text-xs text-muted-foreground/60 italic">
                    *Services are provided directly by Marie Stopes Ghana. Fees apply as per their standard rates.
                </p>
            </div>
        </div>
    </div>
  );
}
