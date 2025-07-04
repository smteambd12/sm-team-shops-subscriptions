
-- Add product details columns to order_items table for better tracking
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS product_category text,
ADD COLUMN IF NOT EXISTS product_description text,
ADD COLUMN IF NOT EXISTS package_features text[];

-- Create a function to get detailed order information with all product details
CREATE OR REPLACE FUNCTION public.get_order_details_with_products(order_uuid uuid)
RETURNS TABLE (
  order_id uuid,
  customer_name text,
  customer_email text,
  customer_phone text,
  total_amount numeric,
  status text,
  created_at timestamptz,
  product_id text,
  product_name text,
  product_category text,
  product_description text,
  package_duration text,
  package_price numeric,
  quantity integer,
  package_features text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id as order_id,
    o.customer_name,
    o.customer_email,
    o.customer_phone,
    o.total_amount,
    o.status,
    o.created_at,
    oi.product_id,
    oi.product_name,
    oi.product_category,
    oi.product_description,
    oi.package_duration,
    oi.price as package_price,
    oi.quantity,
    oi.package_features
  FROM orders o
  JOIN order_items oi ON o.id = oi.order_id
  WHERE o.id = order_uuid;
END;
$$;

-- Update the create_subscription_from_order function to include more product details
CREATE OR REPLACE FUNCTION public.create_subscription_from_order(order_uuid uuid)
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
    
    -- Update order status to confirmed
    UPDATE orders 
    SET status = 'confirmed', updated_at = now()
    WHERE id = order_uuid;
END;
$$;

-- Create a function to handle order confirmation workflow
CREATE OR REPLACE FUNCTION public.confirm_order_and_create_subscriptions(order_uuid uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
    subscription_count integer;
BEGIN
    -- Create subscriptions from the order
    PERFORM create_subscription_from_order(order_uuid);
    
    -- Count created subscriptions
    SELECT COUNT(*) INTO subscription_count
    FROM user_subscriptions
    WHERE order_id = order_uuid;
    
    -- Return success result
    result := json_build_object(
        'success', true,
        'message', 'Order confirmed and subscriptions created',
        'subscription_count', subscription_count,
        'order_id', order_uuid
    );
    
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        -- Return error result
        result := json_build_object(
            'success', false,
            'message', SQLERRM,
            'order_id', order_uuid
        );
        RETURN result;
END;
$$;
