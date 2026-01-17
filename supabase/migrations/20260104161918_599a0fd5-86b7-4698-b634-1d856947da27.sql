-- Add DNI column to affiliates table
ALTER TABLE public.affiliates 
ADD COLUMN IF NOT EXISTS dni text;

-- Update existing records with placeholder values
UPDATE public.affiliates 
SET dni = 'PENDIENTE-' || SUBSTRING(id::text, 1, 8)
WHERE dni IS NULL OR dni = '';

-- Make DNI required and unique
ALTER TABLE public.affiliates 
ALTER COLUMN dni SET NOT NULL;

ALTER TABLE public.affiliates 
ADD CONSTRAINT affiliates_dni_unique UNIQUE (dni);