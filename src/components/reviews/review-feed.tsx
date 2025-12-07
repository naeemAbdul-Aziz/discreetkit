'use client';

import { useEffect, useState, useRef } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { User, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

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

  // Auto-slide effect for mobile
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let intervalId: NodeJS.Timeout;
    const startAutoScroll = () => {
        // Only on mobile/tablet? Or general auto-scroll? User said "on mobile... auto sliding".
        // Checking window width in effect is standard.
        if (window.innerWidth >= 768) return; 

        intervalId = setInterval(() => {
            if (!container) return;
            // Scroll by card width + gap approx
            const cardWidth = 300; 
            const maxScroll = container.scrollWidth - container.clientWidth;
            
            if (container.scrollLeft >= maxScroll - 10) {
                // Reset to start
                container.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                container.scrollBy({ left: cardWidth, behavior: 'smooth' });
            }
        }, 4000); // 4 seconds per slide
    };

    startAutoScroll();

    return () => clearInterval(intervalId);
  }, [reviews]);


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
      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 px-4 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // Ensure scrollbar is hidden
      >
        {reviews.map((review) => (
          <Card key={review.id} className="min-w-[280px] w-[85vw] md:w-auto snap-center bg-card/50 backdrop-blur border-none shadow-sm h-full">
            <CardContent className="p-5 space-y-3 flex flex-col h-full">
              {review.title && (
                  <h4 className="font-bold text-base text-primary leading-tight">{review.title}</h4>
              )}
              {/* <Quote className="h-4 w-4 text-primary/40" /> */}
              <p className="text-sm text-foreground/90 line-clamp-4 leading-relaxed flex-grow">
                "{review.content}"
              </p>
              <div className="flex items-center gap-2 pt-2 mt-auto border-t border-border/50">
                <div className="text-xs text-muted-foreground">
                    {/* Completely Anonymous - Just Title or "Community Member" if no title? 
                        User: "no need to add names - maybe we can keep the titiles"
                    */} 
                    <span className="italic">{formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}</span>
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
