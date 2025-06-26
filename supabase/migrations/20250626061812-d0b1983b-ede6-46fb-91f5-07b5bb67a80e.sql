
-- Insert sample products
INSERT INTO products (id, name, description, category, image, features, is_active) VALUES
('netflix-premium', 'Netflix Premium', '4K স্ট্রিমিং, ৪টি ডিভাইসে একসাথে দেখুন', 'web', 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400&h=300&fit=crop', ARRAY['4K Ultra HD', '৪টি স্ক্রিন', 'ডাউনলোড সুবিধা', 'সব কন্টেন্ট'], true),
('spotify-premium', 'Spotify Premium', 'অ্যাড ফ্রি মিউজিক, অফলাইন ডাউনলোড', 'web', 'https://images.unsplash.com/photo-1611339555312-e607c8352fd7?w=400&h=300&fit=crop', ARRAY['অ্যাড ফ্রি', 'অফলাইন ডাউনলোড', 'উন্নত অডিও', 'সব গান'], true),
('canva-pro', 'Canva Pro', 'প্রো টেমপ্লেট, ব্যাকগ্রাউন্ড রিমুভার', 'web', 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop', ARRAY['প্রো টেমপ্লেট', 'ব্যাকগ্রাউন্ড রিমুভার', 'ব্র্যান্ড কিট', 'টিম ফিচার'], true),
('kinemaster-pro', 'KineMaster Pro', 'প্রো ভিডিও এডিটিং, ওয়াটারমার্ক ফ্রি', 'mobile', 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop', ARRAY['ওয়াটারমার্ক ফ্রি', 'প্রো এফেক্ট', '4K এক্সপোর্ট', 'সব ফিচার'], true),
('web-dev-course', 'ওয়েব ডেভেলপমেন্ট কোর্স', 'সম্পূর্ণ ওয়েব ডেভেলপমেন্ট শিখুন', 'tutorial', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop', ARRAY['HTML/CSS/JS', 'React/Node.js', 'প্রজেক্ট বেসড', 'লাইভ সাপোর্ট'], true)
ON CONFLICT (id) DO NOTHING;

-- Insert product packages
INSERT INTO product_packages (id, product_id, duration, price, original_price, discount, is_active) VALUES
-- Netflix packages
('netflix-1m', 'netflix-premium', '1month', 350, 500, 30, true),
('netflix-3m', 'netflix-premium', '3month', 900, 1500, 40, true),
('netflix-6m', 'netflix-premium', '6month', 1600, 3000, 47, true),
('netflix-lifetime', 'netflix-premium', 'lifetime', 2500, 5000, 50, true),

-- Spotify packages
('spotify-1m', 'spotify-premium', '1month', 200, 300, 33, true),
('spotify-3m', 'spotify-premium', '3month', 550, 900, 39, true),
('spotify-6m', 'spotify-premium', '6month', 1000, 1800, 44, true),
('spotify-lifetime', 'spotify-premium', 'lifetime', 1800, 3600, 50, true),

-- Canva packages
('canva-1m', 'canva-pro', '1month', 400, 600, 33, true),
('canva-3m', 'canva-pro', '3month', 1100, 1800, 39, true),
('canva-6m', 'canva-pro', '6month', 2000, 3600, 44, true),
('canva-lifetime', 'canva-pro', 'lifetime', 3500, 7200, 51, true),

-- KineMaster packages
('kinemaster-1m', 'kinemaster-pro', '1month', 300, 450, 33, true),
('kinemaster-3m', 'kinemaster-pro', '3month', 800, 1350, 41, true),
('kinemaster-6m', 'kinemaster-pro', '6month', 1400, 2700, 48, true),
('kinemaster-lifetime', 'kinemaster-pro', 'lifetime', 2200, 4500, 51, true),

-- Web Dev Course packages
('webdev-1m', 'web-dev-course', '1month', 1500, 2500, 40, true),
('webdev-3m', 'web-dev-course', '3month', 3500, 6000, 42, true),
('webdev-6m', 'web-dev-course', '6month', 6000, 12000, 50, true),
('webdev-lifetime', 'web-dev-course', 'lifetime', 8000, 15000, 47, true)
ON CONFLICT (id) DO NOTHING;

-- Insert site settings with default values
INSERT INTO site_settings (setting_key, setting_value, description) VALUES
('bkash_number', '01712345678', 'bKash পেমেন্ট নম্বর'),
('nagad_number', '01812345678', 'Nagad পেমেন্ট নম্বর'),
('rocket_number', '01912345678', 'Rocket পেমেন্ট নম্বর'),
('live_chat_number', '01612345678', 'WhatsApp লাইভ চ্যাট নম্বর')
ON CONFLICT (setting_key) DO UPDATE SET
setting_value = EXCLUDED.setting_value,
description = EXCLUDED.description;
