/**
 * @file use-onboarding.ts
 * @description A hook to manage the state of the new user guided tour using localStorage.
 */
'use client';

import { create } from 'zustand';

const ONBOARDING_KEY = 'discreetkit-tour-complete-v1';

interface OnboardingState {
  run: boolean;
  stepIndex: number;
  startTour: () => void;
  handleJoyrideCallback: (data: any) => void;
}

const useOnboardingStore = create<OnboardingState>((set, get) => ({
  run: false,
  stepIndex: 0,
  startTour: () => {
    try {
      const hasCompletedTour = localStorage.getItem(ONBOARDING_KEY);
      if (!hasCompletedTour) {
        set({ run: true });
      }
    } catch (error) {
      console.error('Failed to access localStorage for onboarding:', error);
      // Failsafe to start tour if localStorage is unavailable
      set({ run: true });
    }
  },
  handleJoyrideCallback: (data) => {
    const { action, index, status, type } = data;
    const { run } = get();

    if (!run) return;

    if (['step:after', 'target:not-found'].includes(type)) {
      // Update step index
      set({ stepIndex: index + (action === 'next' ? 1 : -1) });
    } else if (['finished', 'skipped'].includes(status)) {
      // Tour finished or skipped, mark as complete
      try {
        localStorage.setItem(ONBOARDING_KEY, 'true');
      } catch (error) {
        console.error('Failed to update localStorage for onboarding:', error);
      }
      set({ run: false, stepIndex: 0 });
    }
  },
}));

export const useOnboarding = useOnboardingStore;
