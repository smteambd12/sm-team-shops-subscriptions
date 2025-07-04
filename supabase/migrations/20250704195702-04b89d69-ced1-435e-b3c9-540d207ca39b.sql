
-- Update the trigger function to concatenate price, quantity, and duration with + signs
CREATE OR REPLACE FUNCTION update_order_summary_fields()
RETURNS TRIGGER AS $$
DECLARE
    order_record RECORD;
    product_names TEXT := '';
    product_prices TEXT := '';
    product_quantities TEXT := '';
    duration_days_text TEXT := '';
    total_price NUMERIC := 0;
    total_quantity INTEGER := 0;
    total_days INTEGER := 0;
BEGIN
    -- Get concatenated product information for the order
    SELECT 
        string_agg(DISTINCT product_name, ' + ' ORDER BY product_name) as names,
        string_agg((price * quantity)::text, ' + ' ORDER BY created_at) as prices,
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
    INTO product_names, product_prices, product_quantities, duration_days_text, total_price, total_quantity, total_days
    FROM order_items 
    WHERE order_id = COALESCE(NEW.order_id, OLD.order_id);
    
    -- Update the orders table with concatenated information
    -- We'll store concatenated values in product_name, product_price (as text), product_quantity, duration_days
    -- But we need to be careful with data types
    UPDATE orders 
    SET 
        product_name = product_names,
        product_price = total_price, -- Keep this as numeric for calculations
        product_quantity = total_quantity, -- Keep this as numeric for calculations  
        duration_days = total_days, -- Keep this as numeric for calculations
        updated_at = now()
    WHERE id = COALESCE(NEW.order_id, OLD.order_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Add new columns to store concatenated text versions
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS product_price_text TEXT,
ADD COLUMN IF NOT EXISTS product_quantity_text TEXT,
ADD COLUMN IF NOT EXISTS duration_days_text TEXT;

-- Update the trigger function again to use the new text columns
CREATE OR REPLACE FUNCTION update_order_summary_fields()
RETURNS TRIGGER AS $$
DECLARE
    order_record RECORD;
    product_names TEXT := '';
    product_prices TEXT := '';
    product_quantities TEXT := '';
    duration_days_text TEXT := '';
    total_price NUMERIC := 0;
    total_quantity INTEGER := 0;
    total_days INTEGER := 0;
BEGIN
    -- Get concatenated product information for the order
    SELECT 
        string_agg(DISTINCT product_name, ' + ' ORDER BY product_name) as names,
        string_agg((price * quantity)::text, ' + ' ORDER BY created_at) as prices,
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
    INTO product_names, product_prices, product_quantities, duration_days_text, total_price, total_quantity, total_days
    FROM order_items 
    WHERE order_id = COALESCE(NEW.order_id, OLD.order_id);
    
    -- Update the orders table with both concatenated text and numeric totals
    UPDATE orders 
    SET 
        product_name = product_names,
        product_price = total_price, -- Numeric total for calculations
        product_quantity = total_quantity, -- Numeric total for calculations
        duration_days = total_days, -- Numeric total for calculations
        product_price_text = product_prices, -- Text with + separators
        product_quantity_text = product_quantities, -- Text with + separators
        duration_days_text = duration_days_text, -- Text with + separators
        updated_at = now()
    WHERE id = COALESCE(NEW.order_id, OLD.order_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Update all existing orders with the new concatenated information
DO $$
DECLARE
    order_id_var UUID;
BEGIN
    FOR order_id_var IN (SELECT DISTINCT id FROM orders)
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
            product_price_text = (
                SELECT string_agg((price * quantity)::text, ' + ' ORDER BY created_at)
                FROM order_items 
                WHERE order_id = order_id_var
            ),
            product_quantity_text = (
                SELECT string_agg(quantity::text, ' + ' ORDER BY created_at)
                FROM order_items 
                WHERE order_id = order_id_var
            ),
            duration_days_text = (
                SELECT string_agg(
                    CASE 
                        WHEN package_duration = '1month' THEN '30'
                        WHEN package_duration = '3month' THEN '90'
                        WHEN package_duration = '6month' THEN '180'
                        WHEN package_duration = 'lifetime' THEN '36500'
                        ELSE '30'
                    END, 
                    ' + ' ORDER BY created_at
                )
                FROM order_items 
                WHERE order_id = order_id_var
            ),
            updated_at = now()
        WHERE id = order_id_var;
    END LOOP;
END $$;
