-- Add payment_type column to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_type text DEFAULT 'winner_points';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'completed';
-- payment_status: 'completed' (WP paid instantly), 'pending_verification', 'verified', 'rejected'

-- Add WP tracking columns to commissions
ALTER TABLE public.commissions ADD COLUMN IF NOT EXISTS wp_credited boolean DEFAULT false;
ALTER TABLE public.commissions ADD COLUMN IF NOT EXISTS wp_amount numeric DEFAULT 0;

-- Add payment configuration to business_settings
ALTER TABLE public.business_settings ADD COLUMN IF NOT EXISTS yape_number text;
ALTER TABLE public.business_settings ADD COLUMN IF NOT EXISTS plin_number text;
ALTER TABLE public.business_settings ADD COLUMN IF NOT EXISTS bank_account text;
ALTER TABLE public.business_settings ADD COLUMN IF NOT EXISTS bank_name text;
ALTER TABLE public.business_settings ADD COLUMN IF NOT EXISTS wp_conversion_rate numeric DEFAULT 10;

-- Create payment_proofs table for direct payment verification
CREATE TABLE IF NOT EXISTS public.payment_proofs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  proof_url text NOT NULL,
  payment_method text NOT NULL, -- yape, plin, transfer
  amount numeric NOT NULL,
  status text DEFAULT 'pending', -- pending, approved, rejected
  admin_notes text,
  verified_by uuid,
  verified_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on payment_proofs
ALTER TABLE public.payment_proofs ENABLE ROW LEVEL SECURITY;

-- RLS policies for payment_proofs
CREATE POLICY "Admins can manage payment proofs"
ON public.payment_proofs FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own payment proofs"
ON public.payment_proofs FOR SELECT
USING (order_id IN (
  SELECT id FROM orders WHERE customer_email = (
    SELECT email FROM auth.users WHERE id = auth.uid()
  )
));

CREATE POLICY "Authenticated users can create payment proofs"
ON public.payment_proofs FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Create storage bucket for payment proofs
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for payment proofs bucket
CREATE POLICY "Authenticated users can upload payment proofs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'payment-proofs' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their own payment proofs"
ON storage.objects FOR SELECT
USING (bucket_id = 'payment-proofs' AND (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'admin'::app_role) OR
    (storage.foldername(name))[1] = auth.uid()::text
  )
));

CREATE POLICY "Admins can view all payment proofs"
ON storage.objects FOR SELECT
USING (bucket_id = 'payment-proofs' AND has_role(auth.uid(), 'admin'::app_role));

-- Function to process commission to WinnerPoints
CREATE OR REPLACE FUNCTION public.process_commission_to_wp(p_commission_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_commission commissions%ROWTYPE;
  v_affiliate affiliates%ROWTYPE;
  v_user_credit_id uuid;
  v_wp_amount numeric;
  v_conversion_rate numeric;
  v_new_balance numeric;
BEGIN
  -- Get commission
  SELECT * INTO v_commission FROM commissions WHERE id = p_commission_id;
  
  IF v_commission IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Comisión no encontrada');
  END IF;
  
  IF v_commission.wp_credited THEN
    RETURN json_build_object('success', false, 'error', 'Comisión ya fue acreditada');
  END IF;
  
  -- Get affiliate
  SELECT * INTO v_affiliate FROM affiliates WHERE id = v_commission.affiliate_id;
  
  IF v_affiliate.user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Afiliado sin usuario asociado');
  END IF;
  
  -- Get conversion rate from settings
  SELECT COALESCE(wp_conversion_rate, 10) INTO v_conversion_rate 
  FROM business_settings LIMIT 1;
  
  -- Calculate WP amount (commission in soles * conversion rate)
  v_wp_amount := v_commission.amount * v_conversion_rate;
  
  -- Get or create user_credits
  SELECT id INTO v_user_credit_id FROM user_credits WHERE user_id = v_affiliate.user_id;
  
  IF v_user_credit_id IS NULL THEN
    INSERT INTO user_credits (user_id, email, balance)
    VALUES (v_affiliate.user_id, v_affiliate.email, v_wp_amount)
    RETURNING id, balance INTO v_user_credit_id, v_new_balance;
  ELSE
    UPDATE user_credits 
    SET balance = balance + v_wp_amount
    WHERE id = v_user_credit_id
    RETURNING balance INTO v_new_balance;
  END IF;
  
  -- Record transaction
  INSERT INTO credit_transactions (user_credit_id, amount, type, description)
  VALUES (
    v_user_credit_id, 
    v_wp_amount, 
    'commission', 
    'Comisión Nivel ' || v_commission.level || ' - Orden pagada con dinero'
  );
  
  -- Mark commission as credited
  UPDATE commissions 
  SET wp_credited = true, wp_amount = v_wp_amount
  WHERE id = p_commission_id;
  
  RETURN json_build_object('success', true, 'wp_credited', v_wp_amount, 'new_balance', v_new_balance);
END;
$$;

-- Function to verify payment and process commissions
CREATE OR REPLACE FUNCTION public.verify_direct_payment(
  p_order_id uuid,
  p_approved boolean,
  p_admin_notes text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order orders%ROWTYPE;
  v_commission RECORD;
  v_result json;
BEGIN
  -- Check admin role
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN json_build_object('success', false, 'error', 'No autorizado');
  END IF;
  
  -- Get order
  SELECT * INTO v_order FROM orders WHERE id = p_order_id;
  
  IF v_order IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Orden no encontrada');
  END IF;
  
  IF v_order.payment_type != 'dinero_real' THEN
    RETURN json_build_object('success', false, 'error', 'Esta orden no es de pago directo');
  END IF;
  
  IF p_approved THEN
    -- Update order status
    UPDATE orders 
    SET payment_status = 'verified', status = 'Confirmado'
    WHERE id = p_order_id;
    
    -- Update payment proof
    UPDATE payment_proofs 
    SET status = 'approved', verified_by = auth.uid(), verified_at = now(), admin_notes = p_admin_notes
    WHERE order_id = p_order_id;
    
    -- Process all commissions for this order to WP
    FOR v_commission IN SELECT id FROM commissions WHERE order_id = p_order_id
    LOOP
      PERFORM process_commission_to_wp(v_commission.id);
    END LOOP;
    
    RETURN json_build_object('success', true, 'message', 'Pago verificado y comisiones acreditadas');
  ELSE
    -- Reject payment
    UPDATE orders 
    SET payment_status = 'rejected', status = 'Cancelado'
    WHERE id = p_order_id;
    
    UPDATE payment_proofs 
    SET status = 'rejected', verified_by = auth.uid(), verified_at = now(), admin_notes = p_admin_notes
    WHERE order_id = p_order_id;
    
    RETURN json_build_object('success', true, 'message', 'Pago rechazado');
  END IF;
END;
$$;

-- Update create_order_commissions to work with both payment types
-- The commissions are created but wp_credited stays false until payment is verified for dinero_real