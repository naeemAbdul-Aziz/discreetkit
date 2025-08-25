
'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { products } from '@/lib/data';

const locations = [
  'Legon Campus',
  'UPSA',
  'Accra',
  'GIMPA',
  'East Legon',
  'Madina',
  'Wisconsin Campus',
  'Central University',
];

const generateRandomOrder = () => {
  const location = locations[Math.floor(Math.random() * locations.length)];
  const product = products[Math.floor(Math.random() * products.length)];
  return {
    location,
    productName: product.name.includes('HIV') ? 'an HIV Test Kit' : 'a Test Kit',
  };
};

export function RecentOrders() {
  const [order, setOrder] = useState(generateRandomOrder());
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const showInterval = setInterval(() => {
      setIsVisible(true);
      // Hide after 5 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 5000);
      // Then change order and wait for the next cycle
      setTimeout(() => {
        setOrder(generateRandomOrder());
      }, 6000);
    }, 10000); // Show every 10 seconds

    return () => clearInterval(showInterval);
  }, []);

  return (
    <div className="fixed bottom-4 left-4 z-50 hidden md:block">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4 rounded-lg bg-background p-4 shadow-lg border"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <ShoppingBag className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Someone from {order.location}
              </p>
              <p className="text-sm text-muted-foreground">just ordered {order.productName}.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
