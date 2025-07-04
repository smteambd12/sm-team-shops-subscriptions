
-- Fix RLS policies for order-attachments storage bucket
-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Users can upload their order attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can view order attachments" ON storage.objects;

-- Create more permissive policies for order attachments
CREATE POLICY "Anyone can insert order attachments"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'order-attachments');

CREATE POLICY "Anyone can view order attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'order-attachments');

CREATE POLICY "Anyone can update order attachments"
ON storage.objects FOR UPDATE
USING (bucket_id = 'order-attachments');

-- Remove unnecessary tables that are not needed for your website
DROP TABLE IF EXISTS ai_features CASCADE;
DROP TABLE IF EXISTS bengali_holidays CASCADE;
DROP TABLE IF EXISTS credit_packages CASCADE;
DROP TABLE IF EXISTS premium_plans CASCADE;
DROP TABLE IF EXISTS user_premium_subscriptions CASCADE;
DROP TABLE IF EXISTS user_credits CASCADE;

-- Add RLS policy for subscription_notifications table
CREATE POLICY "Users can view their subscription notifications"
ON subscription_notifications FOR SELECT
USING (EXISTS (
  SELECT 1 FROM user_subscriptions 
  WHERE user_subscriptions.id = subscription_notifications.subscription_id 
  AND user_subscriptions.user_id = auth.uid()
));

CREATE POLICY "System can insert subscription notifications"
ON subscription_notifications FOR INSERT
WITH CHECK (true);
