/**
 * @file tour-provider.tsx
 * @description Provides the guided product tour for new users using react-joyride.
 */
'use client';

import { useState, useEffect } from 'react';
import Joyride, { type Step, type CallBackProps, STATUS } from 'react-joyride';
import { useChatbot } from '@/hooks/use-chatbot';
import { ArrowRight } from 'lucide-react';

const ONBOARDING_KEY = 'discreetkit-tour-complete-v1';

const tourSteps: Step[] = [
  {
    target: '#products',
    content: 'Welcome! Start by exploring our confidential health products. Your privacy is our priority.',
    disableBeacon: true,
    placement: 'bottom',
  },
  {
    target: '#how-it-works',
    content: 'See our simple, 4-step process for getting your products delivered discreetly and securely.',
    placement: 'top',
  },
  {
    target: '#featured-favorites',
    content: 'Discover our most popular bundles and save. These are curated based on what our community loves.',
    placement: 'top',
  },
  {
    target: '#ask-pacely-cta',
    content: 'Have questions? Pacely, our AI assistant, can help with product info, delivery, and more, 24/7.',
    placement: 'top',
  }
];

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [runTour, setRunTour] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { setIsOpen: setChatbotOpen } = useChatbot();

  useEffect(() => {
    setIsMounted(true);
    try {
      const hasCompletedTour = localStorage.getItem(ONBOARDING_KEY);
      if (!hasCompletedTour) {
        setTimeout(() => {
          setRunTour(true);
        }, 1500);
      }
    } catch (error) {
      console.error("Could not access localStorage for onboarding tour:", error);
    }
  }, []);
  
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, action, index, type } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRunTour(false);
      try {
        localStorage.setItem(ONBOARDING_KEY, 'true');
      } catch (error) {
        console.error("Failed to update localStorage for onboarding:", error);
      }
    } else if (type === 'step:after' && action === 'next' && index === 3) {
      // The tour is on the last step, and user clicked next.
      // We also stop the tour here before opening the chatbot.
      setRunTour(false);
      setChatbotOpen(true);
       try {
        localStorage.setItem(ONBOARDING_KEY, 'true');
      } catch (error) {
        console.error("Failed to update localStorage for onboarding:", error);
      }
    }
  };


  return (
    <>
      {children}
      {isMounted && (
        <Joyride
          callback={handleJoyrideCallback}
          continuous
          run={runTour}
          steps={tourSteps}
          showProgress
          showSkipButton
          locale={{
            next: (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                Next <ArrowRight size={16} />
              </span>
            ),
          }}
          styles={{
            options: {
              zIndex: 10000,
              primaryColor: 'hsl(var(--primary))',
              textColor: 'hsl(var(--foreground))',
              arrowColor: 'hsl(var(--background))',
            },
            buttonNext: {
              borderRadius: '9999px',
            },
            buttonBack: {
              borderRadius: '9999px',
            },
            tooltip: {
              borderRadius: 'var(--radius)',
              backgroundColor: 'hsl(var(--background))',
            },
            spotlight: {
                borderRadius: 'var(--radius)',
            }
          }}
        />
      )}
    </>
  );
}
