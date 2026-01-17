-- Fix 1: Add restrictive RLS policy to affiliates table requiring authentication
-- This prevents anonymous access to sensitive PII data
CREATE POLICY "Require authentication for affiliates access" 
ON public.affiliates 
AS RESTRICTIVE
FOR ALL
USING (auth.uid() IS NOT NULL);

-- Fix 2: Update database functions to use generic error messages
-- This prevents information leakage through detailed error messages

-- Update add_user_credits to use generic errors
CREATE OR REPLACE FUNCTION public.add_user_credits(p_email text, p_amount numeric, p_description text DEFAULT 'Créditos añadidos por admin'::text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid;
  v_user_credit_id uuid;
  v_new_balance numeric;
BEGIN
  -- Check if caller is admin (use generic error)
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE LOG 'Unauthorized add_credits attempt by user %', auth.uid();
    RETURN json_build_object('success', false, 'error', 'Operación no permitida');
  END IF;

  -- Find user by email (use generic error)
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
  
  IF v_user_id IS NULL THEN
    RAISE LOG 'User not found for email in add_user_credits';
    RETURN json_build_object('success', false, 'error', 'No se pudo completar la operación');
  END IF;

  -- Get or create user_credits record
  SELECT id INTO v_user_credit_id FROM user_credits WHERE user_id = v_user_id;
  
  IF v_user_credit_id IS NULL THEN
    INSERT INTO user_credits (user_id, email, balance)
    VALUES (v_user_id, p_email, p_amount)
    RETURNING id, balance INTO v_user_credit_id, v_new_balance;
  ELSE
    UPDATE user_credits 
    SET balance = balance + p_amount
    WHERE id = v_user_credit_id
    RETURNING balance INTO v_new_balance;
  END IF;

  -- Record transaction
  INSERT INTO credit_transactions (user_credit_id, amount, type, description, admin_id)
  VALUES (v_user_credit_id, p_amount, 'add', p_description, auth.uid());

  RETURN json_build_object(
    'success', true, 
    'new_balance', v_new_balance,
    'email', p_email
  );
END;
$function$;

-- Update process_withdrawal_request to use generic errors
CREATE OR REPLACE FUNCTION public.process_withdrawal_request(p_request_id uuid, p_status text, p_admin_notes text DEFAULT NULL::text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_request withdrawal_requests%ROWTYPE;
  v_current_balance numeric;
BEGIN
  -- Check if caller is admin (generic error)
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE LOG 'Unauthorized withdrawal processing attempt by user %', auth.uid();
    RETURN json_build_object('success', false, 'error', 'Operación no permitida');
  END IF;

  -- Get request (generic error)
  SELECT * INTO v_request FROM withdrawal_requests WHERE id = p_request_id;
  
  IF v_request IS NULL THEN
    RAISE LOG 'Withdrawal request not found: %', p_request_id;
    RETURN json_build_object('success', false, 'error', 'No se pudo completar la operación');
  END IF;

  IF v_request.status != 'pending' THEN
    RAISE LOG 'Withdrawal already processed: %', p_request_id;
    RETURN json_build_object('success', false, 'error', 'No se pudo completar la operación');
  END IF;

  -- If approving, check balance and deduct
  IF p_status = 'approved' THEN
    SELECT balance INTO v_current_balance FROM user_credits WHERE id = v_request.user_credit_id;
    
    IF v_current_balance < v_request.amount THEN
      RAISE LOG 'Insufficient balance for withdrawal: %', p_request_id;
      RETURN json_build_object('success', false, 'error', 'No se pudo completar la operación');
    END IF;

    -- Deduct credits
    UPDATE user_credits 
    SET balance = balance - v_request.amount
    WHERE id = v_request.user_credit_id;

    -- Record transaction
    INSERT INTO credit_transactions (user_credit_id, amount, type, description, admin_id, point_value_at_time)
    VALUES (v_request.user_credit_id, -v_request.amount, 'withdrawal', 'Retiro de WinnerPoints aprobado', auth.uid(), v_request.point_value_at_request);
  END IF;

  -- Update request
  UPDATE withdrawal_requests 
  SET status = p_status,
      admin_notes = p_admin_notes,
      processed_by = auth.uid(),
      processed_at = now()
  WHERE id = p_request_id;

  RETURN json_build_object('success', true, 'status', p_status);
END;
$function$;

-- Update use_credits_for_purchase to use generic errors (without balance disclosure)
CREATE OR REPLACE FUNCTION public.use_credits_for_purchase(p_amount numeric, p_order_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_credit_id uuid;
  v_current_balance numeric;
  v_new_balance numeric;
BEGIN
  -- Get user's credit record (generic error, no balance disclosure)
  SELECT id, balance INTO v_user_credit_id, v_current_balance 
  FROM user_credits 
  WHERE user_id = auth.uid();
  
  IF v_user_credit_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'No se pudo completar la compra');
  END IF;

  IF v_current_balance < p_amount THEN
    -- Don't reveal exact balance in error
    RETURN json_build_object('success', false, 'error', 'Saldo insuficiente para esta compra');
  END IF;

  -- Deduct credits
  UPDATE user_credits 
  SET balance = balance - p_amount
  WHERE id = v_user_credit_id
  RETURNING balance INTO v_new_balance;

  -- Record transaction
  INSERT INTO credit_transactions (user_credit_id, amount, type, description, order_id)
  VALUES (v_user_credit_id, -p_amount, 'purchase', 'Compra con WinnerPoints', p_order_id);

  RETURN json_build_object(
    'success', true, 
    'new_balance', v_new_balance
  );
END;
$function$;