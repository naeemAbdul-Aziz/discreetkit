/**
 * @file tour-provider.tsx
 * @description Provides a guided tour for new users using react-joyride.
 *              It manages the tour state and defines the steps.
 */
'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Joyride, { type Step, CallBackProps, STATUS } from 'react-joyride';
import { Button } from './ui/button';
import Link from 'next/link';

const TOUR_STEPS: Step[] = [
  {
    target: 'body',
    content: "Welcome to DiscreetKit! Let's take a quick tour of how everything works.",
    placement: 'center',
    title: 'Welcome!',
  },
  {
    target: '#products',
    content: 'Start here. Browse our confidential test kits, wellness products, and value bundles.',
    placement: 'top',
    title: 'Our Products',
  },
  {
    target: '#how-it-works',
    content: 'Learn about our simple, private, and secure 4-step process, from ordering to getting support.',
    placement: 'top',
    title: 'How It Works',
  },
  {
    target: '#ask-pacely-cta',
    content: 'Have questions? Our friendly AI assistant, Pacely, can help you with information about products, privacy, and more.',
    placement: 'top',
    title: 'Ask Pacely AI',
  },
  // Anchor to a stable wrapper instead of the floating button to avoid overlap on mobile
  {
    target: '#products',
    content: 'When you are ready, scroll to products to start your order. The floating button is also available, but we keep this view clear on mobile.',
    placement: 'top',
    title: 'Start Shopping',
  },
  {
    target: 'body',
    placement: 'center',
    title: "You're All Set!",
    content: (
        <div className="flex flex-col items-center text-center">
            <p>Thanks for taking the tour! You now know how to find products, understand the process, and get help if you need it.</p>
            <Link href="/products" className="mt-4">
                <Button>Start Shopping</Button>
            </Link>
        </div>
    ),
    hideFooter: true,
  },
];

const TOUR_COMPLETED_KEY = 'discreetkit-tour-completed';

export function TourProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [run, setRun] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // Only run the tour on the homepage
    if (pathname !== '/') {
      setRun(false);
      return;
    }

    try {
      const tourCompleted = window.localStorage.getItem(TOUR_COMPLETED_KEY);
      if (!tourCompleted) {
        // Use a timeout to ensure the page elements are rendered
        setTimeout(() => {
          setRun(true);
        }, 1500);
      }
    } catch (error) {
      console.error('Could not access localStorage for tour:', error);
    }
  }, [pathname, isMounted]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, action, index, type } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      try {
        window.localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
        setRun(false);
      } catch (error) {
        console.error('Could not save tour state to localStorage:', error);
      }
    } else if (type === 'step:after' && action === 'next' && index === 4) {
      // Special handling for the last step if it has a custom component
      // This forces the tour to "finish" when the user clicks the custom button
      const step = TOUR_STEPS[index + 1];
      if (step && step.hideFooter) {
         try {
            window.localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
            setRun(false);
        } catch (error) {
            console.error('Could not save tour state to localStorage:', error);
        }
      }
    }
  };

  // Do not render Joyride on non-homepage routes or during SSR
  if (pathname !== '/' || !isMounted) {
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
        scrollToFirstStep
        disableOverlayClose
        disableScrollParentFix
        hideCloseButton
        spotlightClicks
        locale={{ next: 'Next', back: 'Back', skip: 'Skip', last: 'Done' }}
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
            padding: 0,
            width: 'min(90vw, 340px)',
          },
          tooltipContainer: {
            textAlign: 'left',
          },
          tooltipTitle: {
            margin: 0,
            padding: '1rem 1.25rem',
            fontSize: '1.125rem',
            fontWeight: 700,
            borderBottom: '1px solid hsl(var(--border))',
          },
          tooltipContent: {
            padding: '1.25rem',
            margin: 0,
            fontSize: '0.95rem',
          },
          tooltipFooter: {
            margin: 0,
            padding: '0 1.25rem 1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          },
          buttonNext: {
            borderRadius: '9999px',
            fontSize: '14px',
            padding: '0.5rem 1.25rem',
            backgroundColor: 'hsl(var(--primary))',
          },
          buttonBack: {
            borderRadius: '9999px',
            fontSize: '14px',
            padding: '0.5rem 1rem',
            color: 'hsl(var(--foreground))',
          },
          buttonSkip: {
            fontSize: '14px',
            color: 'hsl(var(--muted-foreground))'
          }
        }}
      />
    </>
  );
}
