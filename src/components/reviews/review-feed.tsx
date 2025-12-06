'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { User, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

type Review = {
  id: number;
  content: string;
  author_name: string;
  created_at: string;
  is_approved: boolean; // Just in case we filter later
};

export function ReviewFeed() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const supabase = getSupabaseClient();

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
    <div className="relative w-full overflow-hidden py-4 bg-muted/30 rounded-xl">
      <div className="flex gap-4 overflow-x-auto pb-4 px-4 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible">
        {reviews.map((review) => (
          <Card key={review.id} className="min-w-[280px] snap-center bg-card/50 backdrop-blur border-none shadow-sm h-full">
            <CardContent className="p-4 space-y-3">
              <Quote className="h-4 w-4 text-primary/40" />
              <p className="text-sm text-foreground/90 line-clamp-4 leading-relaxed">
                "{review.content}"
              </p>
              <div className="flex items-center gap-2 pt-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                    <User size={12} />
                  </AvatarFallback>
                </Avatar>
                <div className="text-xs">
                    <span className="font-medium text-foreground">{review.author_name || 'Anonymous'}</span>
                    <span className="text-muted-foreground mx-1">•</span>
                    <span className="text-muted-foreground">{formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
       {/* Fade edges for horizontal scroll on mobile */}
       <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent md:hidden pointer-events-none" />
       <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent md:hidden pointer-events-none" />
    </div>
  );
}
