'use client';

import { ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export function TrustBadge() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-brand-indigo/[0.03] rounded-full border border-brand-indigo/10 shadow-sm"
    >
      <ShieldCheck className="w-3.5 h-3.5 text-brand-indigo" />
      <span className="text-[10px] font-bold text-brand-indigo/80 uppercase tracking-[0.1em]">
        Guest Checkout Only • Data Wiped Daily
      </span>
    </motion.div>
  );
}
