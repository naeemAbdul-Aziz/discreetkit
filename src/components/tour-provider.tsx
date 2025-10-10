/**
 * @file tour-provider.tsx
 * @description Provides a guided tour for new users using react-joyride.
 *              It manages the tour state and defines the steps.
 */
'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Joyride, { type Step, CallBackProps, STATUS } from 'react-joyride';

const TOUR_STEPS: Step[] = [
  {
    target: 'body',
    content: "Welcome to DiscreetKit! Let's take a quick tour of how everything works.",
    placement: 'center',
  },
  {
    target: '#products',
    content: 'Start here. Browse our confidential test kits, wellness products, and bundles.',
    placement: 'bottom',
    title: 'Our Products',
  },
  {
    target: '#how-it-works',
    content: 'Learn about our simple, private, and secure 4-step process, from ordering to support.',
    placement: 'top',
    title: 'How It Works',
  },
  {
    target: '#ask-pacely-cta',
    content: 'Have questions? Our friendly AI assistant, Pacely, can help you with information about products, privacy, and more.',
    placement: 'top',
    title: 'Ask Pacely AI',
  },
  {
    target: '#cart-icon',
    content: 'When you add items to your cart, you can review your order and check out from here.',
    placement: 'bottom',
    title: 'Your Cart',
  },
];

const TOUR_COMPLETED_KEY = 'discreetkit-tour-completed';

export function TourProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [run, setRun] = useState(false);

  useEffect(() => {
    // Only run the tour on the homepage
    if (pathname !== '/') {
      return;
    }

    try {
      const tourCompleted = window.localStorage.getItem(TOUR_COMPLETED_KEY);
      if (!tourCompleted) {
        // Use a timeout to ensure the page elements are rendered
        setTimeout(() => {
          setRun(true);
        }, 1000);
      }
    } catch (error) {
      console.error('Could not access localStorage for tour:', error);
    }
  }, [pathname]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      try {
        window.localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
        setRun(false);
      } catch (error) {
        console.error('Could not save tour state to localStorage:', error);
      }
    }
  };

  // Do not render Joyride on non-homepage routes
  if (pathname !== '/') {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <Joyride
        run={run}
        steps={TOUR_STEPS}
        continuous
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
        styles={{
          options: {
            arrowColor: 'hsl(var(--card))',
            backgroundColor: 'hsl(var(--card))',
            primaryColor: 'hsl(var(--primary))',
            textColor: 'hsl(var(--foreground))',
            zIndex: 1000,
          },
          tooltip: {
            borderRadius: 'var(--radius)',
          },
          buttonNext: {
            borderRadius: '9999px',
            fontSize: '14px',
          },
          buttonBack: {
            borderRadius: '9999px',
            fontSize: '14px',
          },
        }}
      />
    </>
  );
}
