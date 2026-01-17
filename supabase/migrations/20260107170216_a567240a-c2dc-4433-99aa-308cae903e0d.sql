-- Fix: Remove overly permissive RESTRICTIVE policies that were added previously
-- These policies defeat the purpose of owner-scoped access control

-- Remove from orders table (same issue as affiliates)
DROP POLICY IF EXISTS "Require authentication for orders access" ON public.orders;