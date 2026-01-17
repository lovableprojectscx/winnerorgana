-- Add shipping information fields to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS shipping_company text,
ADD COLUMN IF NOT EXISTS tracking_code text,
ADD COLUMN IF NOT EXISTS shipping_voucher_url text,
ADD COLUMN IF NOT EXISTS shipped_at timestamp with time zone;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_tracking_code ON public.orders(tracking_code);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(customer_email);