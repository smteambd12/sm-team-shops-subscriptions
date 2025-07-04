
-- Fix the ambiguous column reference in the trigger
DROP TRIGGER IF EXISTS update_order_summary_trigger ON order_items;

-- Recreate the trigger function with table aliases to avoid ambiguity
CREATE OR REPLACE FUNCTION public.update_order_summary_fields()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    order_record RECORD;
    product_names TEXT := '';
    product_prices TEXT := '';
    product_quantities TEXT := '';
    duration_days_text_val TEXT := '';
    total_price NUMERIC := 0;
    total_quantity INTEGER := 0;
    total_days INTEGER := 0;
BEGIN
    -- Get concatenated product information for the order
    SELECT 
        string_agg(DISTINCT oi.product_name, ' + ' ORDER BY oi.product_name) as names,
        string_agg((oi.price * oi.quantity)::text, ' + ' ORDER BY oi.created_at) as prices,
        string_agg(oi.quantity::text, ' + ' ORDER BY oi.created_at) as quantities,
        string_agg(
            CASE 
                WHEN oi.package_duration = '1month' THEN '30'
                WHEN oi.package_duration = '3month' THEN '90'
                WHEN oi.package_duration = '6month' THEN '180'
                WHEN oi.package_duration = 'lifetime' THEN '36500'
                ELSE '30'
            END, 
            ' + ' ORDER BY oi.created_at
        ) as durations,
        SUM(oi.price * oi.quantity) as total_price_calc,
        SUM(oi.quantity) as total_quantity_calc,
        SUM(
            CASE 
                WHEN oi.package_duration = '1month' THEN 30
                WHEN oi.package_duration = '3month' THEN 90
                WHEN oi.package_duration = '6month' THEN 180
                WHEN oi.package_duration = 'lifetime' THEN 36500
                ELSE 30
            END * oi.quantity
        ) as total_duration
    INTO product_names, product_prices, product_quantities, duration_days_text_val, total_price, total_quantity, total_days
    FROM order_items oi
    WHERE oi.order_id = COALESCE(NEW.order_id, OLD.order_id);
    
    -- Update the orders table with both concatenated text and numeric totals
    UPDATE orders 
    SET 
        product_name = product_names,
        product_price = total_price,
        product_quantity = total_quantity,
        duration_days = total_days,
        product_price_text = product_prices,
        product_quantity_text = product_quantities,
        duration_days_text = duration_days_text_val,
        updated_at = now()
    WHERE id = COALESCE(NEW.order_id, OLD.order_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Recreate the trigger
CREATE TRIGGER update_order_summary_trigger
    AFTER INSERT OR UPDATE OR DELETE ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_order_summary_fields();

-- Add RLS policy to allow admins to delete orders
DROP POLICY IF EXISTS "Admins can delete orders" ON orders;
CREATE POLICY "Admins can delete orders" 
    ON orders 
    FOR DELETE 
    USING (EXISTS (
        SELECT 1 FROM admin_users 
        WHERE user_id = auth.uid() AND role = 'admin'
    ));

-- Add RLS policy to allow admins to view all orders
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
CREATE POLICY "Admins can view all orders" 
    ON orders 
    FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM admin_users 
        WHERE user_id = auth.uid() AND role = 'admin'
    ));

-- Add RLS policy to allow admins to update all orders
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;
CREATE POLICY "Admins can update all orders" 
    ON orders 
    FOR UPDATE 
    USING (EXISTS (
        SELECT 1 FROM admin_users 
        WHERE user_id = auth.uid() AND role = 'admin'
    ));

-- Add RLS policy to allow admins to view all order items  
DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;
CREATE POLICY "Admins can view all order items" 
    ON order_items 
    FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM admin_users 
        WHERE user_id = auth.uid() AND role = 'admin'
    ));

-- Add RLS policy to allow admins to delete order items
DROP POLICY IF EXISTS "Admins can delete order items" ON order_items;
CREATE POLICY "Admins can delete order items" 
    ON order_items 
    FOR DELETE 
    USING (EXISTS (
        SELECT 1 FROM admin_users 
        WHERE user_id = auth.uid() AND role = 'admin'
    ));
