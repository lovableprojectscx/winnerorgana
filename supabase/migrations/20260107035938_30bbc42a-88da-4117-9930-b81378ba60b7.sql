-- Fix create_order_commissions function to add authentication and validation
-- This prevents unauthorized commission creation and replay attacks

CREATE OR REPLACE FUNCTION public.create_order_commissions(p_order_id uuid, p_order_amount numeric, p_affiliate_code text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_affiliate_id uuid;
  v_current_affiliate_id uuid;
  v_referred_by uuid;
  v_level integer;
  v_commission_rates numeric[] := ARRAY[0.10, 0.04, 0.02, 0.02, 0.01, 0.01, 0.01];
  v_commission_amount numeric;
  v_order_exists boolean;
  v_actual_amount numeric;
  v_commission_exists boolean;
BEGIN
  -- Verify caller is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Verify the order exists
  SELECT EXISTS(
    SELECT 1 FROM orders 
    WHERE id = p_order_id
  ) INTO v_order_exists;
  
  IF NOT v_order_exists THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  -- Get the actual order amount from the database (don't trust client)
  SELECT amount INTO v_actual_amount
  FROM orders 
  WHERE id = p_order_id;
  
  -- Check if commissions already exist for this order (prevent duplicates)
  SELECT EXISTS(
    SELECT 1 FROM commissions WHERE order_id = p_order_id
  ) INTO v_commission_exists;
  
  IF v_commission_exists THEN
    RAISE EXCEPTION 'Commissions already created for this order';
  END IF;

  -- Find the affiliate by code
  SELECT id, referred_by
  INTO v_affiliate_id, v_referred_by
  FROM affiliates 
  WHERE affiliate_code = UPPER(p_affiliate_code);
  
  IF v_affiliate_id IS NULL THEN
    RETURN; -- No valid affiliate found
  END IF;
  
  -- Level 1 Commission (10%) - Direct seller
  v_commission_amount := v_actual_amount * v_commission_rates[1];
  INSERT INTO commissions (affiliate_id, order_id, amount, level, status)
  VALUES (v_affiliate_id, p_order_id, v_commission_amount, 1, 'pending');
  
  -- Update level 1 affiliate's totals
  UPDATE affiliates 
  SET total_sales = COALESCE(total_sales, 0) + v_actual_amount,
      total_commissions = COALESCE(total_commissions, 0) + v_commission_amount
  WHERE id = v_affiliate_id;
  
  -- Process levels 2-7 (following the referral chain)
  v_current_affiliate_id := v_referred_by;
  v_level := 2;
  
  WHILE v_current_affiliate_id IS NOT NULL AND v_level <= 7 LOOP
    v_commission_amount := v_actual_amount * v_commission_rates[v_level];
    
    -- Insert commission for this level
    INSERT INTO commissions (affiliate_id, order_id, amount, level, status)
    VALUES (v_current_affiliate_id, p_order_id, v_commission_amount, v_level, 'pending');
    
    -- Update affiliate's commissions
    UPDATE affiliates 
    SET total_commissions = COALESCE(total_commissions, 0) + v_commission_amount
    WHERE id = v_current_affiliate_id;
    
    -- Get next referrer in the chain
    SELECT referred_by INTO v_referred_by
    FROM affiliates WHERE id = v_current_affiliate_id;
    
    v_current_affiliate_id := v_referred_by;
    v_level := v_level + 1;
  END LOOP;
END;
$function$;