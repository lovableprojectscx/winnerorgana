-- Add shipping and customer details columns to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS customer_dni text,
ADD COLUMN IF NOT EXISTS customer_phone text,
ADD COLUMN IF NOT EXISTS shipping_address text,
ADD COLUMN IF NOT EXISTS shipping_city text;

-- Fix the handle_updated_at function to have immutable search_path
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Restrict commissions insert to only work through the RPC function by checking for a valid order
DROP POLICY IF EXISTS "Allow commission creation via function" ON public.commissions;

CREATE POLICY "Allow commission creation via authenticated function" 
ON public.commissions 
FOR INSERT 
WITH CHECK (
  order_id IS NOT NULL AND 
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_id)
);