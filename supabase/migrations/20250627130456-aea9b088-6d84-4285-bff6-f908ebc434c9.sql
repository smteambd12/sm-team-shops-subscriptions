
-- Add 4 promo codes to the database
INSERT INTO promo_codes (code, discount_type, discount_value, min_order_amount, max_uses, is_active, expires_at) VALUES
('SAVE20', 'percentage', 20, 500, 100, true, '2024-12-31T23:59:59Z'),
('WINTER30', 'percentage', 30, 1000, 50, true, '2024-12-31T23:59:59Z'),
('FLAT100', 'fixed', 100, 300, 200, true, '2024-12-31T23:59:59Z'),
('MEGA50', 'percentage', 50, 2000, 25, true, '2024-12-31T23:59:59Z');

-- Add site setting for search customization
INSERT INTO site_settings (setting_key, setting_value, description, setting_type) VALUES
('search_placeholder', 'প্রোডাক্ট খুঁজুন...', 'Search box placeholder text', 'text'),
('enable_advanced_search', 'true', 'Enable advanced search features', 'boolean')
ON CONFLICT (setting_key) DO UPDATE SET
setting_value = EXCLUDED.setting_value,
updated_at = now();
