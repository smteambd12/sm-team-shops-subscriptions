
-- Insert test user subscriptions
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
  subscription_file_url,
  subscription_link,
  file_name
) VALUES 
(
  (SELECT id FROM auth.users LIMIT 1),
  'premium-service',
  'প্রিমিয়াম সার্ভিস',
  '1month',
  1500,
  now(),
  now() + interval '1 month',
  true,
  false,
  'https://example.com/premium-guide.pdf',
  'https://premium.example.com',
  'প্রিমিয়াম গাইড.pdf'
),
(
  (SELECT id FROM auth.users LIMIT 1),
  'basic-service',
  'বেসিক সার্ভিস',
  '3month',
  3000,
  now(),
  now() + interval '5 days', -- Will expire soon for notification testing
  true,
  true,
  null,
  'https://basic.example.com',
  null
);

-- Insert test subscription notifications
INSERT INTO subscription_notifications (
  subscription_id,
  notification_type,
  sent_at
) VALUES 
(
  (SELECT id FROM user_subscriptions WHERE product_name = 'প্রিমিয়াম সার্ভিস' LIMIT 1),
  'expiry_warning',
  now() - interval '2 days'
),
(
  (SELECT id FROM user_subscriptions WHERE product_name = 'বেসিক সার্ভিস' LIMIT 1),
  'expiry_warning',
  now() - interval '1 day'
);
