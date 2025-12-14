'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CategoryShapeProps {
    category: string;
    className?: string;
}

export function CategoryShape({ category, className }: CategoryShapeProps) {
    if (category === 'Test Kits') {
        return (
            <div className={cn("relative w-full h-full overflow-hidden bg-sky-50", className)}>
                <motion.div 
                    className="absolute inset-0 flex items-center justify-center"
                    initial="rest"
                    whileHover="hover"
                    animate="rest"
                >
                    {/* Abstract Precision/Geometric Shape */}
                    <svg viewBox="0 0 200 200" className="w-full h-full p-4">
                         {/* Background Circle */}
                        <motion.circle 
                            cx="100" cy="100" r="80" 
                            className="fill-sky-200/50"
                            variants={{
                                rest: { scale: 1 },
                                hover: { scale: 1.05 }
                            }}
                            transition={{ duration: 0.4 }}
                        />
                         {/* Cross/Plus Sign - evoking medical/test but abstract */}
                         <motion.rect
                            x="85" y="40" width="30" height="120" rx="15"
                            className="fill-sky-500"
                            variants={{
                                rest: { y: 0 },
                                hover: { y: -5 }
                            }}
                             transition={{ duration: 0.4, ease: "easeOut" }}
                        />
                         <motion.rect
                            x="40" y="85" width="120" height="30" rx="15"
                            className="fill-sky-400"
                             variants={{
                                rest: { x: 0 },
                                hover: { x: 5 }
                            }}
                             transition={{ duration: 0.4, ease: "easeOut" }}
                        />
                         {/* Floating orbital */}
                         <motion.circle
                            cx="150" cy="50" r="15"
                            className="fill-teal-400"
                            variants={{
                                rest: { y: 0, x: 0 },
                                hover: { y: -10, x: 10 }
                            }}
                            transition={{ duration: 0.5, yoyo: Infinity }}
                         />
                    </svg>
                </motion.div>
            </div>
        );
    }

    if (category === 'Wellness Essentials') {
        return (
             <div className={cn("relative w-full h-full overflow-hidden bg-rose-50", className)}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    {/* Organic/Fluid Shapes */}
                    <svg viewBox="0 0 200 200" className="w-full h-full p-4">
                         <motion.path
                            d="M98.6,-133.4C125.6,-116.5,143.9,-86.6,151.7,-54.6C159.5,-22.6,156.9,11.5,142.4,39.4C127.9,67.3,101.5,89,72.7,104.9C43.9,120.7,12.7,130.8,-15.8,126.9C-44.3,123,-70.1,105.1,-90.4,83.4C-110.7,61.7,-125.5,36.2,-129.5,8.8C-133.5,-18.6,-126.6,-47.9,-109.8,-71.4C-93,-94.9,-66.2,-112.6,-38.3,-128.8C-10.4,-145,18.6,-159.7,48,-155C77.4,-150.3,107.1,-126.3,98.6,-133.4Z"
                            transform="translate(100 100) scale(0.6)"
                            className="fill-rose-200"
                            initial={{ rotate: 0 }}
                            whileHover={{ rotate: 10, scale: 1.1 }}
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                        />
                         <motion.circle
                            cx="100" cy="100" r="40"
                            className="fill-rose-400"
                            initial={{ scale: 1 }}
                            whileHover={{ scale: 1.2 }}
                            transition={{ duration: 0.3 }}
                         />
                           <motion.circle
                            cx="130" cy="70" r="20"
                            className="fill-orange-300"
                            initial={{ y: 0 }}
                            whileHover={{ y: -15 }}
                            transition={{ duration: 0.4 }}
                         />
                    </svg>
                  </div>
             </div>
        );
    }

    if (category === 'Value Bundles') {
        return (
             <div className={cn("relative w-full h-full overflow-hidden bg-purple-50", className)}>
                 <div className="absolute inset-0 flex items-center justify-center">
                    {/* Interconnected/Layered Shapes */}
                     <svg viewBox="0 0 200 200" className="w-full h-full p-4">
                        <motion.rect
                            x="50" y="50" width="100" height="100" rx="20"
                            className="fill-purple-300"
                            initial={{ rotate: 0 }}
                            whileHover={{ rotate: -15 }}
                             transition={{ duration: 0.4 }}
                        />
                         <motion.circle
                            cx="100" cy="100" r="60"
                            className="fill-yellow-300 mix-blend-multiply"
                             initial={{ scale: 0.8, x: 20, y: 20 }}
                            whileHover={{ scale: 1, x: 0, y: 0 }}
                             transition={{ duration: 0.4 }}
                        />
                         <motion.rect
                            x="40" y="40" width="40" height="40" rx="10"
                            className="fill-purple-500"
                            initial={{ y: 0 }}
                            whileHover={{ y: -20, rotate: 20 }}
                             transition={{ duration: 0.5 }}
                        />
                    </svg>
                 </div>
             </div>
        );
    }
    
    if (category === 'Medication Refills') {
         return (
             <div className={cn("relative w-full h-full overflow-hidden bg-emerald-50", className)}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    {/* Structured/Repeating Pattern */}
                     <svg viewBox="0 0 200 200" className="w-full h-full p-4">
                        <motion.g
                            initial={{ gap: 0 }}
                            whileHover={{ scale: 1.05 }}
                             transition={{ duration: 0.4 }}
                        >
                            <circle cx="60" cy="60" r="25" className="fill-emerald-300" />
                            <circle cx="140" cy="60" r="25" className="fill-emerald-400" />
                            <circle cx="60" cy="140" r="25" className="fill-emerald-400" />
                            <circle cx="140" cy="140" r="25" className="fill-emerald-300" />
                            
                            {/* Connecting pills */}
                            <motion.rect 
                                x="70" y="60" width="60" height="10" rx="5" 
                                className="fill-emerald-200" 
                                initial={{ width: 60, x: 70 }}
                                whileHover={{ width: 80, x: 60 }}
                            />
                             <motion.rect 
                                x="60" y="70" width="10" height="60" rx="5" 
                                className="fill-emerald-200"
                                 initial={{ height: 60, y: 70 }}
                                whileHover={{ height: 80, y: 60 }}
                            />

                        </motion.g>
                    </svg>
                  </div>
             </div>
        );
    }

    // Default fallback
    return <div className={cn("bg-muted", className)} />;
}
