'use client';

import { Phone, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

interface MobileActionBarProps {
  phone: string;
  whatsapp: string;
}

export function MobileActionBar({ phone, whatsapp }: MobileActionBarProps) {
  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t border-border z-50 md:hidden pb-safe"
    >
      <div className="flex gap-3">
        <a 
          href={`tel:${phone}`}
          className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold py-3.5 rounded-xl active:scale-95 transition-transform"
        >
          <Phone className="w-5 h-5" />
          Call Now
        </a>
        <a 
          href={`https://wa.me/233${whatsapp.substring(1)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold py-3.5 rounded-xl active:scale-95 transition-transform"
        >
          <MessageSquare className="w-5 h-5" />
          WhatsApp
        </a>
      </div>
    </motion.div>
  );
}
