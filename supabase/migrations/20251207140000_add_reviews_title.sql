-- Add title column to reviews table
ALTER TABLE public.reviews 
ADD COLUMN title text;

-- Update comment to reflect change
COMMENT ON TABLE public.reviews IS 'Customer reviews and testimonials with optional titles.';
