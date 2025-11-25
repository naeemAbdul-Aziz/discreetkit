'use client';

import { ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export function TrustBadge() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-full border border-primary/10"
    >
      <ShieldCheck className="w-3.5 h-3.5 text-primary" />
      <span className="text-[10px] font-semibold text-primary/80 uppercase tracking-wider">
        Guest Checkout Only • Data Wiped Daily
      </span>
    </motion.div>
  );
}
