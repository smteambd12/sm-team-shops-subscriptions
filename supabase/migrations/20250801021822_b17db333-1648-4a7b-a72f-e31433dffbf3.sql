
-- Insert sample popular products
INSERT INTO popular_products (product_id, title, description, media_type, media_url, thumbnail_url, priority, is_active) VALUES
('netflix-premium', 'নেটফ্লিক্স প্রিমিয়াম', 'বিশ্বের সেরা স্ট্রিমিং সার্ভিস। হাজারো সিনেমা ও সিরিয়াল উপভোগ করুন।', 'image', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&h=150&fit=crop', 100, true),
('spotify-premium', 'স্পটিফাই প্রিমিয়াম', 'লাখো গান বিনা বিজ্ঞাপনে শুনুন। সেরা মিউজিক স্ট্রিমিং।', 'image', 'https://images.unsplash.com/photo-1611339555312-e607c8352fd7?w=400&h=300&fit=crop', 'https://images.unsplash.com/photo-1611339555312-e607c8352fd7?w=200&h=150&fit=crop', 90, true),
('canva-pro', 'ক্যানভা প্রো', 'প্রফেশনাল ডিজাইন টুলস। টেমপ্লেট, ফন্ট এবং ইমেজের বিশাল কালেকশন।', 'image', 'https://images.unsplash.com/photo-1558655146-364adaf1fcc9?w=400&h=300&fit=crop', 'https://images.unsplash.com/photo-1558655146-364adaf1fcc9?w=200&h=150&fit=crop', 80, true),
('adobe-creative', 'অ্যাডোবি ক্রিয়েটিভ ক্লাউড', 'ফটোশপ, ইলাস্ট্রেটর, প্রিমিয়ার প্রো সহ সকল অ্যাডোবি সফটওয়্যার।', 'image', 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=400&h=300&fit=crop', 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=200&h=150&fit=crop', 70, true);

-- Insert sample offer products
INSERT INTO offer_products (title, description, image_url, discount_percentage, original_price, offer_price, is_active, priority, shareable_slug) VALUES
('বিগ বান্ডেল অফার', 'নেটফ্লিক্স + স্পটিফাই + ক্যানভা প্রো একসাথে। বিশাল সাশ্রয়ে তিনটি প্রিমিয়াম সার্ভিস।', 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=400&h=300&fit=crop', 50, 1500, 750, true, 100, 'big-bundle-offer'),
('স্টুডেন্ট স্পেশাল', 'শিক্ষার্থীদের জন্য বিশেষ ছাড়ে অ্যাডোবি ক্রিয়েটিভ ক্লাউড। পড়াশোনার পাশাপাশি স্কিল ডেভেলপ করুন।', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=300&fit=crop', 60, 1200, 480, true, 90, 'student-special-adobe'),
('এন্টারটেইনমেন্ট প্যাক', 'নেটফ্লিক্স + স্পটিফাই কম্বো। সিনেমা, সিরিয়াল আর গান একসাথে।', 'https://images.unsplash.com/photo-1489599006549-c49c4ea41d3c?w=400&h=300&fit=crop', 40, 800, 480, true, 80, 'entertainment-pack');

-- Insert offer product items for the bundle offers
INSERT INTO offer_product_items (offer_product_id, product_id, package_id, quantity) VALUES
((SELECT id FROM offer_products WHERE shareable_slug = 'big-bundle-offer'), 'netflix-premium', '3month', 1),
((SELECT id FROM offer_products WHERE shareable_slug = 'big-bundle-offer'), 'spotify-premium', '3month', 1),
((SELECT id FROM offer_products WHERE shareable_slug = 'big-bundle-offer'), 'canva-pro', '3month', 1),

((SELECT id FROM offer_products WHERE shareable_slug = 'student-special-adobe'), 'adobe-creative', '6month', 1),

((SELECT id FROM offer_products WHERE shareable_slug = 'entertainment-pack'), 'netflix-premium', '1month', 1),
((SELECT id FROM offer_products WHERE shareable_slug = 'entertainment-pack'), 'spotify-premium', '1month', 1);

-- Add site settings for section toggles
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES
('popular_products_enabled', 'true', 'boolean', 'পপুলার প্রোডাক্ট সেকশন চালু/বন্ধ'),
('offer_products_enabled', 'true', 'boolean', 'অফার প্রোডাক্ট সেকশন চালু/বন্ধ'),
('enable_product_sharing', 'true', 'boolean', 'প্রোডাক্ট শেয়ারিং ফিচার চালু/বন্ধ');

-- Add shareable slugs to existing products if they don't have them
UPDATE products SET id = LOWER(REPLACE(REPLACE(name, ' ', '-'), 'এবং', 'and')) WHERE id NOT LIKE '%-%';
