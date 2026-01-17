-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon TEXT DEFAULT 'Package',
  color TEXT DEFAULT '#10b981',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Anyone can view categories
CREATE POLICY "Anyone can view categories" 
ON public.categories 
FOR SELECT 
USING (true);

-- Admins can manage categories
CREATE POLICY "Admins can manage categories" 
ON public.categories 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add category_id and tags to products table
ALTER TABLE public.products 
ADD COLUMN category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
ADD COLUMN tags TEXT[] DEFAULT '{}';

-- Create index for better performance
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_tags ON public.products USING GIN(tags);

-- Insert default categories
INSERT INTO public.categories (name, icon, color) VALUES
('Superfoods', 'Leaf', '#10b981'),
('Proteínas', 'Dumbbell', '#3b82f6'),
('Tés e Infusiones', 'Coffee', '#f59e0b'),
('Suplementos', 'Pill', '#8b5cf6'),
('Snacks Saludables', 'Cookie', '#ec4899');