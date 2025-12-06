'use client';

import { ReviewFeed } from '@/components/reviews/review-feed';
import { ReviewForm } from '@/components/reviews/review-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MessageSquarePlus } from 'lucide-react';

export function AnonymousReviewsSection() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-24">
      <div className="flex flex-col items-center justify-center text-center space-y-4 mb-12">
        <h2 className="font-headline text-3xl font-bold md:text-4xl">Community Voices</h2>
        <p className="max-w-[700px] text-muted-foreground md:text-lg">
          Real stories from real people. Anonymous, unfiltered, and helpful.
        </p>
        
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="mt-4 gap-2 rounded-full h-10 px-6">
                    <MessageSquarePlus className="h-4 w-4" />
                    Share Your Story
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl">
                <DialogHeader>
                    <DialogTitle>Share Your Experience</DialogTitle>
                    <DialogDescription>
                        Your feedback helps our community grow. It is completely anonymous.
                    </DialogDescription>
                </DialogHeader>
                <div className="pt-4">
                    <ReviewForm />
                </div>
            </DialogContent>
        </Dialog>
      </div>

      <ReviewFeed />
    </div>
  );
}
