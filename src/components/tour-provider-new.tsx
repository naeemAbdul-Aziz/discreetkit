/**
 * @file tour-provider.tsx
 * @description Provides a simple welcome message for new users.
 *              Temporarily simplified to fix build issues.
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
    if (pathname === '/' && !localStorage.getItem('tour-completed')) {
      setShowWelcome(true);
    }
  }, [pathname]);

  const completeTour = () => {
    localStorage.setItem('tour-completed', 'true');
    setShowWelcome(false);
  };

  return (
    <>
      {children}
      {showWelcome && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">Welcome to DiscreetKit!</h2>
            <p className="mb-4">
              Thanks for visiting! Browse our confidential test kits and wellness products. 
              If you need help, just click the chat button to talk to our AI assistant, Pacely.
            </p>
            <div className="flex gap-2">
              <Button onClick={completeTour} className="flex-1">
                Got it!
              </Button>
              <Link href="/products">
                <Button variant="outline" onClick={completeTour}>
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