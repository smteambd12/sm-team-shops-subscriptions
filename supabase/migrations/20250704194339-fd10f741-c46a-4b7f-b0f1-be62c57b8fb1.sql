
-- Create a function to update order summary fields
CREATE OR REPLACE FUNCTION update_order_summary_fields()
RETURNS TRIGGER AS $$
DECLARE
    order_record RECORD;
    product_names TEXT := '';
    product_prices TEXT := '';
    product_quantities TEXT := '';
    duration_days_list TEXT := '';
    total_days INTEGER;
BEGIN
    -- Get concatenated product information for the order
    SELECT 
        string_agg(product_name, ' + ' ORDER BY created_at) as names,
        string_agg(price::text, ' + ৳' ORDER BY created_at) as prices,
        string_agg(quantity::text, ' + ' ORDER BY created_at) as quantities,
        string_agg(
            CASE 
                WHEN package_duration = '1month' THEN '30'
                WHEN package_duration = '3month' THEN '90'
                WHEN package_duration = '6month' THEN '180'
                WHEN package_duration = 'lifetime' THEN '36500'
                ELSE '30'
            END, 
            ' + ' ORDER BY created_at
        ) as durations,
        SUM(
            CASE 
                WHEN package_duration = '1month' THEN 30
                WHEN package_duration = '3month' THEN 90
                WHEN package_duration = '6month' THEN 180
                WHEN package_duration = 'lifetime' THEN 36500
                ELSE 30
            END * quantity
        ) as total_duration
    INTO product_names, product_prices, product_quantities, duration_days_list, total_days
    FROM order_items 
    WHERE order_id = COALESCE(NEW.order_id, OLD.order_id);
    
    -- Add currency symbol to the beginning of prices
    IF product_prices IS NOT NULL THEN
        product_prices := '৳' || product_prices;
    END IF;
    
    -- Update the orders table with concatenated information
    UPDATE orders 
    SET 
        product_name = product_names,
        product_price = CASE 
            WHEN product_prices IS NOT NULL THEN 
                (SELECT SUM(price * quantity) FROM order_items WHERE order_id = COALESCE(NEW.order_id, OLD.order_id))
            ELSE NULL 
        END,
        product_quantity = (SELECT SUM(quantity) FROM order_items WHERE order_id = COALESCE(NEW.order_id, OLD.order_id)),
        duration_days = total_days
    WHERE id = COALESCE(NEW.order_id, OLD.order_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update order summary when order_items change
DROP TRIGGER IF EXISTS trigger_update_order_summary ON order_items;
CREATE TRIGGER trigger_update_order_summary
    AFTER INSERT OR UPDATE OR DELETE ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_order_summary_fields();

-- Update existing orders with summary information
DO $$
DECLARE
    order_id_var UUID;
BEGIN
    FOR order_id_var IN (SELECT DISTINCT id FROM orders)
    LOOP
        PERFORM update_order_summary_fields() WHERE NEW.order_id = order_id_var;
        
        -- Manual update for existing data
        UPDATE orders 
        SET 
            product_name = (
                SELECT string_agg(product_name, ' + ' ORDER BY created_at)
                FROM order_items 
                WHERE order_id = order_id_var
            ),
            product_price = (
                SELECT SUM(price * quantity)
                FROM order_items 
                WHERE order_id = order_id_var
            ),
            product_quantity = (
                SELECT SUM(quantity)
                FROM order_items 
                WHERE order_id = order_id_var
            ),
            duration_days = (
                SELECT SUM(
                    CASE 
                        WHEN package_duration = '1month' THEN 30
                        WHEN package_duration = '3month' THEN 90
                        WHEN package_duration = '6month' THEN 180
                        WHEN package_duration = 'lifetime' THEN 36500
                        ELSE 30
                    END * quantity
                )
                FROM order_items 
                WHERE order_id = order_id_var
            )
        WHERE id = order_id_var;
    END LOOP;
END $$;
