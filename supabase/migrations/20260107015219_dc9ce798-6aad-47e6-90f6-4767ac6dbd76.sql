
-- Add point_value_at_time to credit_transactions for historical margin calculations
ALTER TABLE public.credit_transactions 
ADD COLUMN IF NOT EXISTS point_value_at_time numeric DEFAULT 0.10;

-- Create withdrawal_requests table
CREATE TABLE public.withdrawal_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  user_credit_id uuid NOT NULL,
  email text NOT NULL,
  amount numeric NOT NULL,
  amount_in_soles numeric NOT NULL,
  point_value_at_request numeric NOT NULL DEFAULT 0.10,
  payment_method text NOT NULL DEFAULT 'yape',
  payment_details text,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  processed_by uuid,
  processed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own withdrawal requests"
ON public.withdrawal_requests
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create withdrawal requests"
ON public.withdrawal_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all withdrawal requests"
ON public.withdrawal_requests
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update withdrawal requests"
ON public.withdrawal_requests
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_withdrawal_requests_updated_at
BEFORE UPDATE ON public.withdrawal_requests
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create index for faster queries
CREATE INDEX idx_withdrawal_requests_user_id ON public.withdrawal_requests(user_id);
CREATE INDEX idx_withdrawal_requests_status ON public.withdrawal_requests(status);
CREATE INDEX idx_credit_transactions_type ON public.credit_transactions(type);

-- Function to process withdrawal request
CREATE OR REPLACE FUNCTION public.process_withdrawal_request(
  p_request_id uuid,
  p_status text,
  p_admin_notes text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_request withdrawal_requests%ROWTYPE;
  v_current_balance numeric;
BEGIN
  -- Check if caller is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN json_build_object('success', false, 'error', 'No autorizado');
  END IF;

  -- Get request
  SELECT * INTO v_request FROM withdrawal_requests WHERE id = p_request_id;
  
  IF v_request IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Solicitud no encontrada');
  END IF;

  IF v_request.status != 'pending' THEN
    RETURN json_build_object('success', false, 'error', 'Solicitud ya procesada');
  END IF;

  -- If approving, check balance and deduct
  IF p_status = 'approved' THEN
    SELECT balance INTO v_current_balance FROM user_credits WHERE id = v_request.user_credit_id;
    
    IF v_current_balance < v_request.amount THEN
      RETURN json_build_object('success', false, 'error', 'Saldo insuficiente del usuario');
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
$$;
