
-- Add some test coins to existing users
INSERT INTO user_coins (user_id, total_coins, earned_coins, spent_coins)
SELECT 
  id as user_id,
  500 as total_coins,
  500 as earned_coins,
  0 as spent_coins
FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM user_coins)
ON CONFLICT (user_id) DO UPDATE SET
  total_coins = EXCLUDED.total_coins,
  earned_coins = EXCLUDED.earned_coins;

-- Add some purchasable promo codes for the coin shop
INSERT INTO purchasable_promo_codes (
  code, title, description, discount_type, discount_value, 
  coin_cost, min_order_amount, max_uses, is_active
) VALUES
  ('COIN10', '১০% ছাড়', 'যেকোনো অর্ডারে ১০% ছাড় পান', 'percentage', 10, 50, 100, 100, true),
  ('COIN20', '২০% ছাড়', 'যেকোনো অর্ডারে ২০% ছাড় পান', 'percentage', 20, 100, 200, 50, true),
  ('MEGA50', '৫০ টাকা ছাড়', 'সরাসরি ৫০ টাকা ছাড়', 'fixed', 50, 75, 150, 200, true),
  ('SUPER100', '১০০ টাকা ছাড়', 'সরাসরি ১০০ টাকা ছাড়', 'fixed', 100, 150, 300, 100, true),
  ('VIP30', '৩০% ছাড়', 'বিশেষ ৩০% ছাড়', 'percentage', 30, 200, 500, 25, true)
ON CONFLICT (code) DO NOTHING;

-- Add some regular promo codes for direct use
INSERT INTO promo_codes (
  code, discount_type, discount_value, min_order_amount, max_uses, is_active
) VALUES
  ('SAVE15', 'percentage', 15, 200, 100, true),
  ('DISCOUNT25', 'percentage', 25, 500, 50, true),
  ('FLAT75', 'fixed', 75, 300, 200, true),
  ('WELCOME10', 'percentage', 10, 100, 500, true),
  ('SPECIAL40', 'percentage', 40, 1000, 20, true)
ON CONFLICT (code) DO NOTHING;

-- Award some coins to first 5 users as test data
WITH first_users AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn 
  FROM auth.users 
  LIMIT 5
)
UPDATE user_coins 
SET total_coins = total_coins + 1000,
    earned_coins = earned_coins + 1000
WHERE user_id IN (SELECT id FROM first_users);
