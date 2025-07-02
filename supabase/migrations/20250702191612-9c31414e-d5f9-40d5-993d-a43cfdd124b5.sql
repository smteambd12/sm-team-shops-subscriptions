
-- Fix Function Search Path Mutable issues by setting proper search_path
-- Update all functions to use proper security settings

-- Fix create_subscription_from_order function
CREATE OR REPLACE FUNCTION public.create_subscription_from_order(order_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    order_record RECORD;
    item_record RECORD;
    start_date TIMESTAMP WITH TIME ZONE;
    end_date TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get order details
    SELECT * INTO order_record FROM orders WHERE id = order_uuid;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order not found';
    END IF;
    
    -- Set start date to now
    start_date := now();
    
    -- Process each order item to create subscriptions
    FOR item_record IN 
        SELECT * FROM order_items WHERE order_id = order_uuid
    LOOP
        -- Calculate end date based on package duration
        CASE item_record.package_duration
            WHEN '1month' THEN
                end_date := start_date + INTERVAL '1 month';
            WHEN '3month' THEN
                end_date := start_date + INTERVAL '3 months';
            WHEN '6month' THEN
                end_date := start_date + INTERVAL '6 months';
            WHEN 'lifetime' THEN
                end_date := start_date + INTERVAL '50 years';
            ELSE
                end_date := start_date + INTERVAL '1 month';
        END CASE;
        
        -- Create subscription for each quantity
        FOR i IN 1..item_record.quantity LOOP
            INSERT INTO user_subscriptions (
                user_id,
                product_id,
                product_name,
                package_duration,
                price,
                starts_at,
                expires_at,
                is_active,
                auto_renew,
                order_id
            ) VALUES (
                order_record.user_id,
                item_record.product_id,
                item_record.product_name,
                item_record.package_duration,
                item_record.price,
                start_date,
                end_date,
                true,
                false,
                order_uuid
            );
        END LOOP;
    END LOOP;
END;
$$;

-- Fix validate_promo_code function
CREATE OR REPLACE FUNCTION public.validate_promo_code(code_text text, order_amount numeric)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    promo_record RECORD;
    discount_amount NUMERIC := 0;
    result JSON;
BEGIN
    -- Get promo code details
    SELECT * INTO promo_record 
    FROM promo_codes 
    WHERE code = code_text 
      AND is_active = true 
      AND (expires_at IS NULL OR expires_at > now())
      AND (max_uses IS NULL OR used_count < max_uses);
    
    IF NOT FOUND THEN
        result := json_build_object(
            'valid', false,
            'message', 'প্রোমো কোড অবৈধ বা মেয়াদ শেষ'
        );
        RETURN result;
    END IF;
    
    -- Check minimum order amount
    IF promo_record.min_order_amount > 0 AND order_amount < promo_record.min_order_amount THEN
        result := json_build_object(
            'valid', false,
            'message', 'ন্যূনতম অর্ডার পরিমাণ ৳' || promo_record.min_order_amount
        );
        RETURN result;
    END IF;
    
    -- Calculate discount
    IF promo_record.discount_type = 'percentage' THEN
        discount_amount := (order_amount * promo_record.discount_value) / 100;
    ELSE
        discount_amount := promo_record.discount_value;
    END IF;
    
    -- Ensure discount doesn't exceed order amount
    IF discount_amount > order_amount THEN
        discount_amount := order_amount;
    END IF;
    
    result := json_build_object(
        'valid', true,
        'discount_amount', discount_amount,
        'code', promo_record.code
    );
    
    RETURN result;
END;
$$;

-- Fix update_subscription_details function
CREATE OR REPLACE FUNCTION public.update_subscription_details(
  p_order_id uuid,
  p_file_url text DEFAULT NULL,
  p_link text DEFAULT NULL,
  p_file_name text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update all subscriptions for this order with the provided details
  UPDATE user_subscriptions 
  SET 
    subscription_file_url = COALESCE(p_file_url, subscription_file_url),
    subscription_link = COALESCE(p_link, subscription_link),
    file_name = COALESCE(p_file_name, file_name),
    updated_at = now()
  WHERE order_id = p_order_id;
  
  -- If no subscriptions exist for this order, log it
  IF NOT FOUND THEN
    RAISE NOTICE 'No subscriptions found for order_id: %', p_order_id;
  END IF;
END;
$$;

-- Fix is_current_user_admin function
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- Fix increment_promo_usage function
CREATE OR REPLACE FUNCTION public.increment_promo_usage(promo_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE promo_codes 
  SET used_count = used_count + 1,
      updated_at = now()
  WHERE code = promo_code;
END;
$$;

-- Configure Auth settings to fix OTP and password protection issues
-- Set OTP expiry to 1 hour (3600 seconds)
INSERT INTO auth.config (parameter, value) 
VALUES ('OTP_EXPIRY', '3600')
ON CONFLICT (parameter) 
DO UPDATE SET value = '3600';

-- Enable password strength requirements
INSERT INTO auth.config (parameter, value) 
VALUES ('PASSWORD_MIN_LENGTH', '8')
ON CONFLICT (parameter) 
DO UPDATE SET value = '8';

-- Enable leaked password protection
INSERT INTO auth.config (parameter, value) 
VALUES ('SECURITY_LEAKED_PASSWORD_PROTECTION', 'true')
ON CONFLICT (parameter) 
DO UPDATE SET value = 'true';
