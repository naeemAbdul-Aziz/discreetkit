/**
 * @file use-onboarding.ts
 * @description A hook to manage the state of the new user guided tour using localStorage.
 */
'use client';

import { create } from 'zustand';
import type { CallBackProps } from 'react-joyride';

const ONBOARDING_KEY = 'discreetkit-tour-complete-v1';

interface OnboardingState {
  run: boolean;
  stepIndex: number;
  setRun: (run: boolean) => void;
  handleJoyrideCallback: (data: CallBackProps) => void;
}

const useOnboardingStore = create<OnboardingState>((set) => ({
  run: false,
  stepIndex: 0,
  setRun: (run) => set({ run }),
  handleJoyrideCallback: (data) => {
    const { action, index, status, type } = data;

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
