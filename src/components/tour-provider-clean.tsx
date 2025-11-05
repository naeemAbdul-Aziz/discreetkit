/**
 * @file tour-provider-clean.tsx
 * @description Clean version of tour provider without react-joyride
 */
'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from './ui/button';
import Link from 'next/link';

interface TourProviderProps {
  children: React.ReactNode;
}

export function TourProvider({ children }: TourProviderProps) {
  const [showWelcome, setShowWelcome] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Only show on home page for first-time users
    if (pathname === '/' && typeof window !== 'undefined' && !localStorage.getItem('tour-completed')) {
      const timer = setTimeout(() => {
        setShowWelcome(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  const completeTour = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tour-completed', 'true');
    }
    setShowWelcome(false);
  };

  return (
    <>
      {children}
      {showWelcome && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4 shadow-xl">
            <h2 className="text-xl font-bold mb-4">Welcome to DiscreetKit!</h2>
            <p className="mb-6 text-gray-600">
              Thanks for visiting! Browse our confidential test kits and wellness products. 
              If you need help, just click the chat button to talk to our AI assistant, Pacely.
            </p>
            <div className="flex gap-3">
              <Button onClick={completeTour} className="flex-1">
                Got it!
              </Button>
              <Link href="/products" className="flex-1">
                <Button variant="outline" onClick={completeTour} className="w-full">
                  Browse Products
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}