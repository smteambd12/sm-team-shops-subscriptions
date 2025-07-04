
-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS trigger_update_order_summary ON order_items;
DROP FUNCTION IF EXISTS update_order_summary_fields();

-- Create an improved function to update order summary fields
CREATE OR REPLACE FUNCTION update_order_summary_fields()
RETURNS TRIGGER AS $$
DECLARE
    order_record RECORD;
    product_names TEXT := '';
    total_price NUMERIC := 0;
    total_quantity INTEGER := 0;
    total_days INTEGER := 0;
BEGIN
    -- Get concatenated product information for the order
    SELECT 
        string_agg(DISTINCT product_name, ' + ' ORDER BY product_name) as names,
        SUM(price * quantity) as total_price_calc,
        SUM(quantity) as total_quantity_calc,
        SUM(
            CASE 
                WHEN package_duration = '1month' THEN 30
                WHEN package_duration = '3month' THEN 90
                WHEN package_duration = '6month' THEN 180
                WHEN package_duration = 'lifetime' THEN 36500
                ELSE 30
            END * quantity
        ) as total_duration
    INTO product_names, total_price, total_quantity, total_days
    FROM order_items 
    WHERE order_id = COALESCE(NEW.order_id, OLD.order_id);
    
    -- Update the orders table with concatenated information
    UPDATE orders 
    SET 
        product_name = product_names,
        product_price = total_price,
        product_quantity = total_quantity,
        duration_days = total_days,
        updated_at = now()
    WHERE id = COALESCE(NEW.order_id, OLD.order_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update order summary when order_items change
CREATE TRIGGER trigger_update_order_summary
    AFTER INSERT OR UPDATE OR DELETE ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_order_summary_fields();

-- Update all existing orders with summary information
DO $$
DECLARE
    order_id_var UUID;
BEGIN
    FOR order_id_var IN (SELECT DISTINCT id FROM orders WHERE product_name IS NULL OR product_name = '')
    LOOP
        -- Manual update for existing data
        UPDATE orders 
        SET 
            product_name = (
                SELECT string_agg(DISTINCT product_name, ' + ' ORDER BY product_name)
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
            ),
            updated_at = now()
        WHERE id = order_id_var;
    END LOOP;
END $$;
