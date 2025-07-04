
-- Add new columns to orders table
ALTER TABLE public.orders 
ADD COLUMN product_name TEXT,
ADD COLUMN product_price NUMERIC,
ADD COLUMN product_quantity INTEGER DEFAULT 1,
ADD COLUMN duration_days INTEGER;

-- Add a comment to clarify the purpose of the new columns
COMMENT ON COLUMN public.orders.product_name IS 'Primary product name from the order';
COMMENT ON COLUMN public.orders.product_price IS 'Primary product price from the order';
COMMENT ON COLUMN public.orders.product_quantity IS 'Primary product quantity from the order';
COMMENT ON COLUMN public.orders.duration_days IS 'Package duration in days (30 for 1 month, 90 for 3 months, 180 for 6 months, null for lifetime)';
