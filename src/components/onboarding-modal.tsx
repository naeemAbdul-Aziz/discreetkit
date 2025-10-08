/**
 * @file onboarding-modal.tsx
 * @description A welcoming modal for first-time visitors to guide them through the site's key features.
 */
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { useOnboarding } from '@/hooks/use-onboarding';
import { ArrowRight, Bot, HeartHandshake, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useChatbot } from '@/hooks/use-chatbot';

const onboardingSteps = [
  {
    icon: ShoppingBag,
    title: 'Explore Our Products',
    description: 'Browse our full range of confidential self-test kits and wellness essentials.',
    href: '/products',
  },
  {
    icon: HeartHandshake,
    title: 'Meet Our Support Partner',
    description: 'Learn about our partnership with Marie Stopes for confidential follow-up care.',
    href: '/partner-care',
  },
  {
    icon: Bot,
    title: 'Ask Pacely AI',
    description: 'Have questions? Our AI assistant can help you with product info, privacy, and more.',
    action: 'openChat',
  },
];

export function OnboardingModal() {
  const { showOnboarding, closeOnboarding } = useOnboarding();
  const { setIsOpen: setChatbotOpen } = useChatbot();
  const [isOpen, setIsOpen] = useState(showOnboarding);

  const handleAction = (step: typeof onboardingSteps[0]) => {
    if (step.action === 'openChat') {
      setChatbotOpen(true);
    }
    setIsOpen(false);
    closeOnboarding();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-center">
            Welcome to DiscreetKit!
          </DialogTitle>
          <DialogDescription className="text-center">
            Your private path to health answers starts here. Let's get you sorted.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {onboardingSteps.map((step) => {
            const isLink = !!step.href;
            const Component = isLink ? Link : 'div';
            
            return (
              <Component
                key={step.title}
                href={step.href || '#'}
                onClick={() => handleAction(step)}
                className="block rounded-lg border p-4 text-left transition-all hover:bg-muted hover:shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                    <step.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              </Component>
            );
          })}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setIsOpen(false);
              closeOnboarding();
            }}
          >
            I'll Explore on My Own
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
