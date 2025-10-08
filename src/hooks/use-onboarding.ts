/**
 * @file use-onboarding.ts
 * @description A hook to manage the state of the new user onboarding experience using localStorage.
 */
'use client';

import { useState, useEffect } from 'react';

const ONBOARDING_KEY = 'discreetkit-onboarding-complete';

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // This effect runs only on the client-side
    const hasCompletedOnboarding = localStorage.getItem(ONBOARDING_KEY);
    if (!hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const closeOnboarding = () => {
    try {
      localStorage.setItem(ONBOARDING_KEY, 'true');
      setShowOnboarding(false);
    } catch (error) {
      console.error('Failed to update localStorage for onboarding:', error);
    }
  };

  return { showOnboarding, closeOnboarding };
}
