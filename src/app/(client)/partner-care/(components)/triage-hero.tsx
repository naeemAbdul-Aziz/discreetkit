'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Pill, Activity, Stethoscope, MessageCircleHeart } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { marieStopesData } from '@/lib/data';

const services = [
  { id: 'contraception', label: 'Contraception' },
  { id: 'sti', label: 'STI Testing' },
  { id: 'consultation', label: 'Consultation' },
  { id: 'counseling', label: 'Counseling' },
];

interface TriageHeroProps {
  onServiceSelect: (serviceId: string) => void;
}

export function TriageHero({ onServiceSelect }: TriageHeroProps) {
  const [selected, setSelected] = useState(services[0].id);

  const handleSelect = (id: string) => {
    setSelected(id);
    onServiceSelect(id);
  };

  return (
    <section className="relative overflow-hidden bg-background pt-24 pb-12 md:pt-32 md:pb-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Confidential Partner Care
            </div>
            
            <h1 className="font-headline text-4xl md:text-6xl font-black tracking-tighter text-foreground mb-6 leading-[0.95]">
              Expert care,<br />
              <span className="text-muted-foreground">zero judgment.</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-lg mb-10 leading-relaxed">
              We've partnered with Marie Stopes to provide you with safe, professional, and completely confidential healthcare services.
            </p>

            {/* Visual Service Grid */}
            <div className="space-y-6">
              <p className="text-sm font-medium text-foreground/60 uppercase tracking-wider">I need help with:</p>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => handleSelect(service.id)}
                    className={cn(
                      "relative group flex flex-col items-start p-4 md:p-5 rounded-2xl border transition-all duration-300 text-left",
                      selected === service.id 
                        ? "bg-primary text-primary-foreground border-primary shadow-lg scale-[1.02]" 
                        : "bg-card text-card-foreground border-border/50 hover:border-primary/50 hover:shadow-md hover:bg-accent/50"
                    )}
                  >
                    <div className={cn(
                      "mb-3 p-2 rounded-xl transition-colors",
                      selected === service.id ? "bg-white/20" : "bg-primary/10 group-hover:bg-primary/20"
                    )}>
                      {service.id === 'contraception' && <Pill className="w-5 h-5" />}
                      {service.id === 'sti' && <Activity className="w-5 h-5" />}
                      {service.id === 'consultation' && <Stethoscope className="w-5 h-5" />}
                      {service.id === 'counseling' && <MessageCircleHeart className="w-5 h-5" />}
                    </div>
                    <span className="font-bold text-sm md:text-base">{service.label}</span>
                    <span className={cn(
                      "text-xs mt-1",
                      selected === service.id ? "text-primary-foreground/80" : "text-muted-foreground"
                    )}>
                      Select to reveal
                    </span>
                    
                    {selected === service.id && (
                      <motion.div
                        layoutId="activeCard"
                        className="absolute inset-0 border-2 border-primary rounded-2xl pointer-events-none"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Visual */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative h-[500px] md:h-[700px] w-full rounded-[2.5rem] overflow-hidden shadow-2xl lg:order-last order-first mb-8 lg:mb-0"
          >
             <Image
                src="https://res.cloudinary.com/dzfa6wqb8/image/upload/v1757955894/counselling_old_lady_modern_xbthvs.jpg"
                alt="Medical Professional"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              
              {/* Floating Badge */}
              <div className="absolute bottom-8 left-8 right-8 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-white">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-white rounded-full p-2 flex items-center justify-center">
                    <Image src={marieStopesData.logoUrl} alt="Logo" width={40} height={40} className="object-contain" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">Marie Stopes Ghana</p>
                    <p className="text-sm text-white/80">Official Healthcare Partner</p>
                  </div>
                </div>
              </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
