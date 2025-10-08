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
  setRun: (run: boolean) => void;
  handleJoyrideCallback: (data: CallBackProps) => void;
}

const useOnboardingStore = create<OnboardingState>((set) => ({
  run: false,
  setRun: (run) => set({ run }),
  handleJoyrideCallback: (data) => {
    const { status } = data;
    const finishedStatuses: string[] = ['finished', 'skipped'];

    if (finishedStatuses.includes(status)) {
      try {
        localStorage.setItem(ONBOARDING_KEY, 'true');
      } catch (error) {
        console.error('Failed to update localStorage for onboarding:', error);
      }
      set({ run: false });
    }
  },
}));

export const useOnboarding = useOnboardingStore;
