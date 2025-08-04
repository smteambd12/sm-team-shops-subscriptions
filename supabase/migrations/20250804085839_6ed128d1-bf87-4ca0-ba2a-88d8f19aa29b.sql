
-- Insert sample purchasable promo codes for the shop
INSERT INTO purchasable_promo_codes (
  title, 
  description, 
  code, 
  discount_type, 
  discount_value, 
  coin_cost, 
  min_order_amount, 
  max_uses,
  is_active
) VALUES 
  ('১০% ছাড় কোড', 'সব পণ্যে ১০% ছাড় পান', 'SAVE10', 'percentage', 10, 50, 100, 100, true),
  ('২০% মেগা ছাড়', 'বিশেষ ২০% ছাড় অফার', 'MEGA20', 'percentage', 20, 100, 500, 50, true),
  ('৫০ টাকা ছাড়', 'সরাসরি ৫০ টাকা ছাড়', 'FLAT50', 'fixed', 50, 30, 200, 200, true),
  ('১৫% বিশেষ ছাড়', 'সীমিত সময়ের জন্য ১৫% ছাড়', 'SPECIAL15', 'percentage', 15, 75, 300, 75, true),
  ('১০০ টাকা ছাড়', 'বড় অর্ডারে ১০০ টাকা ছাড়', 'BIG100', 'fixed', 100, 80, 1000, 30, true);

-- Insert some regular promo codes as well
INSERT INTO promo_codes (
  code,
  discount_type,
  discount_value,
  min_order_amount,
  max_uses,
  is_active
) VALUES
  ('WELCOME10', 'percentage', 10, 100, NULL, true),
  ('SAVE50', 'fixed', 50, 200, NULL, true),
  ('DISCOUNT20', 'percentage', 20, 500, NULL, true);
