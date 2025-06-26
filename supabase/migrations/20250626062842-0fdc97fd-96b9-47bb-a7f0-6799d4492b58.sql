
-- Create the RPC function to increment promo code usage
CREATE OR REPLACE FUNCTION increment_promo_usage(promo_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE promo_codes 
  SET used_count = used_count + 1,
      updated_at = now()
  WHERE code = promo_code AND is_active = true;
END;
$$;
