
-- Add team support settings to site_settings table
INSERT INTO site_settings (setting_key, setting_value, setting_type, description)
VALUES 
  ('team_support_whatsapp_number', '+8801234567890', 'text', 'টিম সাপোর্ট হোয়াটসঅ্যাপ নাম্বার'),
  ('team_support_whatsapp_link', '', 'text', 'টিম সাপোর্ট হোয়াটসঅ্যাপ লিংক (ঐচ্ছিক)'),
  ('team_support_phone_number', '+8801234567890', 'text', 'টিম সাপোর্ট ফোন নাম্বার'),
  ('team_support_email', 'support@yourcompany.com', 'text', 'টিম সাপোর্ট ইমেইল')
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  description = EXCLUDED.description;
