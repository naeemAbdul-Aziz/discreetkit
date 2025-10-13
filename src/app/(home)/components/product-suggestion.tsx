/**
 * @file product-suggestion.tsx
 * @description A component that allows users to suggest new products for the catalog.
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Lightbulb, Loader2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ProductSuggestion() {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestion.trim()) return;
    
    setIsLoading(true);
    // Simulate an API call
    setTimeout(() => {
        setIsLoading(false);
        setSuggestion('');
        toast({
            title: "Suggestion Received!",
            description: "Thank you for helping us improve our catalog.",
        });
    }, 1500);
  }

  return (
    <section id="product-suggestion" className="py-12 md:py-16">
        <div className="container mx-auto max-w-2xl px-4 md:px-6">
             <Card className="rounded-2xl p-4 sm:p-8 bg-card text-center">
                <CardContent className="p-0">
                    <div className="flex flex-col items-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                            <Lightbulb className="h-6 w-6 text-primary" />
                        </div>
                        <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground">
                            Can't Find What You're Looking For?
                        </h2>
                        <p className="mt-2 text-base text-muted-foreground">
                            Help us serve you better. Let us know what products you'd like to see in our catalog.
                        </p>
                    </div>
                    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                        <Textarea 
                            id="suggestion" 
                            placeholder="I would love to see..." 
                            rows={3}
                            value={suggestion}
                            onChange={(e) => setSuggestion(e.target.value)}
                            required 
                        />
                        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    Send Suggestion
                                    <Send />
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    </section>
  );
}
