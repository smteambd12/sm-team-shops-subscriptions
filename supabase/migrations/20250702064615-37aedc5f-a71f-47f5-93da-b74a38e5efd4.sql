
-- Update the orders management admin functionality to include subscription file/link management
-- Create a function to update subscription with file/link when order is confirmed
CREATE OR REPLACE FUNCTION public.update_subscription_details(
  p_order_id UUID,
  p_file_url TEXT DEFAULT NULL,
  p_link TEXT DEFAULT NULL,
  p_file_name TEXT DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Add RLS policy for admin access to this function
CREATE POLICY "Admins can update subscription details" 
ON user_subscriptions FOR UPDATE 
USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));
