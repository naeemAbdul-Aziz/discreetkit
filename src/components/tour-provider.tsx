/**
 * @file tour-provider.tsx
 * @description Provides the guided product tour for new users using react-joyride.
 */
'use client';

import { useEffect } from 'react';
import Joyride, { type Step } from 'react-joyride';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useChatbot } from '@/hooks/use-chatbot';

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
    target: '#partner-referral-cta',
    content: 'We provide a bridge to professional care. Learn about our trusted partners for follow-up support.',
    placement: 'top',
  },
  {
    target: '#ask-pacely-cta',
    content: 'Have questions? Pacely, our AI assistant, can help with product info, delivery, and more, 24/7.',
    placement: 'top',
  }
];

export function TourProvider({ children }: { children: React.ReactNode }) {
  const { run, stepIndex, startTour, handleJoyrideCallback } = useOnboarding();
  const { setIsOpen: setChatbotOpen } = useChatbot();

  useEffect(() => {
    // Start the tour shortly after the page loads to ensure all elements are present
    const timer = setTimeout(() => {
      startTour();
    }, 1000);
    return () => clearTimeout(timer);
  }, [startTour]);
  
  const customCallback = (data: any) => {
    const { action, index, type } = data;
    // Special handling for the last step to open the chatbot
    if (type === 'step:after' && action === 'next' && index === 3) {
      setChatbotOpen(true);
    }
    handleJoyrideCallback(data);
  };

  return (
    <>
      {children}
      <Joyride
        callback={customCallback}
        continuous
        run={run}
        stepIndex={stepIndex}
        steps={tourSteps}
        showProgress
        showSkipButton
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
    </>
  );
}
