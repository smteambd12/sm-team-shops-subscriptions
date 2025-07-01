
-- Function to increment promo code usage count
CREATE OR REPLACE FUNCTION increment_promo_usage(promo_code TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE promo_codes 
    SET used_count = used_count + 1,
        updated_at = now()
    WHERE code = promo_code;
END;
$$;
