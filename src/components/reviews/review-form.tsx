'use client';

import { useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input'; // Optional if we want a name field, but defaulting to anonymous
import { useToast } from '@/hooks/use-toast';
import { Send, Loader2 } from 'lucide-react';

export function ReviewForm() {
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const supabase = getSupabaseClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from('reviews')
                .insert([{ 
                    content: content.trim(),
                    author_name: 'Anonymous Customer' // Keeping it purely anonymous for now
                }]);

            if (error) throw error;

            setContent('');
            toast({
                title: "Thanks for sharing!",
                description: "Your review has been posted anonymously.",
                variant: "default",
            });
        } catch (error) {
            console.error('Error posting review:', error);
            toast({
                title: "Failed to post review",
                description: "Please try again later.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
            <div className="space-y-2">
                <h3 className="text-lg font-semibold text-center">Share Your Experience</h3>
                <p className="text-sm text-muted-foreground text-center">
                    Your feedback helps others. It's completely anonymous.
                </p>
            </div>
            
            <div className="relative">
                <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Tell us about your experience with DiscreetKit..."
                    className="min-h-[100px] bg-background resize-none pr-12"
                    maxLength={280}
                />
                 <div className="absolute bottom-2 right-2 text-[10px] text-muted-foreground">
                    {content.length}/280
                </div>
            </div>

            <Button 
                type="submit" 
                className="w-full" 
                disabled={!content.trim() || isSubmitting}
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Posting...
                    </>
                ) : (
                    <>
                        Post Anonymously
                        <Send className="ml-2 h-4 w-4" />
                    </>
                )}
            </Button>
        </form>
    );
}
