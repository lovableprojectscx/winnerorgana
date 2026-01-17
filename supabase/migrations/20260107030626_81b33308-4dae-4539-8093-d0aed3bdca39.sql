-- Replace the insecure decrease_product_stock function with a secure version
-- that validates the order exists before allowing stock modification

CREATE OR REPLACE FUNCTION public.decrease_product_stock(
  p_product_id uuid, 
  p_quantity integer,
  p_order_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_exists boolean;
BEGIN
  -- Verify the order exists and matches the product
  SELECT EXISTS(
    SELECT 1 FROM orders 
    WHERE id = p_order_id 
    AND product_id = p_product_id
  ) INTO v_order_exists;
  
  IF NOT v_order_exists THEN
    RAISE EXCEPTION 'Invalid order context for stock modification';
  END IF;

  -- Verify sufficient stock
  IF (SELECT stock FROM products WHERE id = p_product_id) < p_quantity THEN
    RAISE EXCEPTION 'Insufficient stock';
  END IF;

  UPDATE products 
  SET stock = GREATEST(0, COALESCE(stock, 0) - p_quantity)
  WHERE id = p_product_id;
END;
$$;