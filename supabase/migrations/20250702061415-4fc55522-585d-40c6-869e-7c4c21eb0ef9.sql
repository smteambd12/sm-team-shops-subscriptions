
-- Add file/link columns to user_subscriptions table
ALTER TABLE user_subscriptions 
ADD COLUMN subscription_file_url TEXT,
ADD COLUMN subscription_link TEXT,
ADD COLUMN file_name TEXT;

-- Create order communications table for user-admin messaging
CREATE TABLE order_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  admin_id UUID,
  message TEXT NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'admin')),
  attachment_url TEXT,
  attachment_name TEXT,
  attachment_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for order communications
ALTER TABLE order_communications ENABLE ROW LEVEL SECURITY;

-- Create policies for order communications
CREATE POLICY "Users can view their order communications" 
ON order_communications FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their order communications" 
ON order_communications FOR INSERT 
WITH CHECK (user_id = auth.uid() AND sender_type = 'user');

CREATE POLICY "Admins can view all order communications" 
ON order_communications FOR SELECT 
USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admins can insert order communications" 
ON order_communications FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()) AND sender_type = 'admin');

-- Create storage bucket for order attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('order-attachments', 'order-attachments', true);

-- Create storage policies for order attachments
CREATE POLICY "Users can upload their order attachments"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'order-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view order attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'order-attachments');

-- Add notification settings to track subscription expiry reminders
CREATE TABLE subscription_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES user_subscriptions(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
