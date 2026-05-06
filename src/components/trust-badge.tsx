'use client';

import { Icon } from "@/components/ui/icon";
import { motion } from 'framer-motion';

export function TrustBadge() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 shadow-sm animate-in fade-in zoom-in duration-500"
    >
      <Icon name="verified_user" className="text-emerald-500" opticalSize={16} fill={true} />
      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
        Guest Checkout Only • Data Wiped Daily
      </span>
    </motion.div>
  );
}
