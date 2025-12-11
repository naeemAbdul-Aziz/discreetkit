'use client';

import { useEffect, useState, useRef } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { User, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ScrollVelocityContainer, ScrollVelocityRow } from '@/components/ui/scroll-based-velocity';

type Review = {
  id: number;
  title?: string;
  content: string;
  author_name: string;
  created_at: string;
  is_approved: boolean; // Just in case we filter later
};

export function ReviewFeed() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const supabase = getSupabaseClient();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Fetch initial reviews
    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (data) {
        setReviews(data);
      }
    };

    fetchReviews();

    // 2. Subscribe to realtime updates
    const channel = supabase
      .channel('public:reviews')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'reviews' },
        (payload: any) => {
          const newReview = payload.new as Review;
          setReviews((prev) => [newReview, ...prev].slice(0, 20));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Split reviews into two rows
  const half = Math.ceil(reviews.length / 2);
  const firstRow = reviews.slice(0, half);
  const secondRow = reviews.slice(half);


  // If no reviews yet, show nothing or placeholder?
  // We'll show a placeholder if empty to encourage the first review.
  if (reviews.length === 0) {
     return (
        <div className="text-center text-muted-foreground py-8 italic">
            Be the first to share your experience anonymously!
        </div>
     )
  }

  return (
    <div className="relative w-full py-8">
      <ScrollVelocityContainer>
        <ScrollVelocityRow baseVelocity={0.5} className="py-4">
          {firstRow.map((review) => (
             <div key={review.id} className="mx-4 inline-block w-[350px]">
                <Card className="h-full bg-card/50 backdrop-blur border-border/50 shadow-sm hover:border-primary/20 transition-colors">
                    <CardContent className="p-5 space-y-3 flex flex-col h-full min-h-[180px]">
                    {review.title && (
                        <h4 className="font-bold text-base text-primary leading-tight">{review.title}</h4>
                    )}
                    <p className="text-sm text-foreground/90 line-clamp-4 leading-relaxed whitespace-normal">
                        "{review.content}"
                    </p>
                    <div className="flex items-center gap-2 pt-2 mt-auto border-t border-border/50">
                        <div className="text-xs text-muted-foreground">
                            <span className="italic">{formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}</span>
                        </div>
                    </div>
                    </CardContent>
                </Card>
             </div>
          ))}
        </ScrollVelocityRow>
        <ScrollVelocityRow baseVelocity={-0.5} className="py-4">
           {secondRow.map((review) => (
             <div key={review.id} className="mx-4 inline-block w-[350px]">
                <Card className="h-full bg-card/50 backdrop-blur border-border/50 shadow-sm hover:border-primary/20 transition-colors">
                    <CardContent className="p-5 space-y-3 flex flex-col h-full min-h-[180px]">
                    {review.title && (
                        <h4 className="font-bold text-base text-primary leading-tight">{review.title}</h4>
                    )}
                    <p className="text-sm text-foreground/90 line-clamp-4 leading-relaxed whitespace-normal">
                        "{review.content}"
                    </p>
                    <div className="flex items-center gap-2 pt-2 mt-auto border-t border-border/50">
                        <div className="text-xs text-muted-foreground">
                            <span className="italic">{formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}</span>
                        </div>
                    </div>
                    </CardContent>
                </Card>
             </div>
          ))}
        </ScrollVelocityRow>
      </ScrollVelocityContainer>
      
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background to-transparent z-10"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background to-transparent z-10"></div>
    </div>
  );
}
