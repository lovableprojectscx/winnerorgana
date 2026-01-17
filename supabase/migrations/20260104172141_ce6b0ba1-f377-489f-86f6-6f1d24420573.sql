-- Add rating column to products table for admin-defined star ratings
ALTER TABLE public.products 
ADD COLUMN rating integer DEFAULT 5 CHECK (rating >= 1 AND rating <= 5);