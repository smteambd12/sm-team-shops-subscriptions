
-- Function to create user subscription when order is confirmed
CREATE OR REPLACE FUNCTION create_subscription_from_order(order_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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
                end_date := start_date + INTERVAL '50 years'; -- Represents lifetime
            ELSE
                end_date := start_date + INTERVAL '1 month'; -- Default fallback
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

-- Function to validate and apply promo code
CREATE OR REPLACE FUNCTION validate_promo_code(code_text TEXT, order_amount NUMERIC)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
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
