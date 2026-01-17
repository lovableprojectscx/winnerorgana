-- Fix: Remove the overly permissive RESTRICTIVE policy on affiliates table
-- The existing owner-scoped and admin policies are sufficient for proper access control
-- This policy was allowing ANY authenticated user to read ALL affiliate data

DROP POLICY IF EXISTS "Require authentication for affiliates access" ON public.affiliates;