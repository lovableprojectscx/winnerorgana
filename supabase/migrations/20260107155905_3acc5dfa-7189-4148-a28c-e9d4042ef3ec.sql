-- Fix: Add restrictive RLS policy to orders table requiring authentication for SELECT
-- Prevents anonymous users from viewing order data (customer PII)
CREATE POLICY "Require authentication for orders access" 
ON public.orders 
AS RESTRICTIVE
FOR SELECT
USING (auth.uid() IS NOT NULL);