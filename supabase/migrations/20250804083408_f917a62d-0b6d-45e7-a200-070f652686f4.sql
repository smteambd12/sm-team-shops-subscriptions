
-- Add some purchasable promo codes to the shop
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
(
    'বিশেষ ছাড়', 
    '২০% ছাড় পান সব প্রোডাক্টে', 
    'SAVE20', 
    'percentage', 
    20, 
    50, 
    500, 
    100, 
    true
),
(
    'নতুন ইউজার অফার', 
    'নতুন ইউজারদের জন্য ১৫% ছাড়', 
    'NEWUSER15', 
    'percentage', 
    15, 
    30, 
    300, 
    200, 
    true
),
(
    'মেগা সেভিংস', 
    '৫০০ টাকা ছাড় পান', 
    'MEGA500', 
    'fixed', 
    500, 
    100, 
    2000, 
    50, 
    true
),
(
    'উইকএন্ড অফার', 
    '২৫% ছাড় শুধু উইকএন্ডে', 
    'WEEKEND25', 
    'percentage', 
    25, 
    75, 
    1000, 
    75, 
    true
),
(
    'ফ্ল্যাশ সেল', 
    '৩০০ টাকা ছাড় সীমিত সময়ের জন্য', 
    'FLASH300', 
    'fixed', 
    300, 
    60, 
    1200, 
    150, 
    true
);

-- Add some coins to a test user (you can replace with actual user IDs)
-- First, let's create some sample coin balances for testing
INSERT INTO user_coins (user_id, total_coins, earned_coins, spent_coins)
SELECT 
    auth.uid() as user_id,
    200 as total_coins,
    200 as earned_coins,
    0 as spent_coins
WHERE auth.uid() IS NOT NULL
ON CONFLICT (user_id) DO UPDATE SET
    total_coins = 200,
    earned_coins = 200,
    spent_coins = 0;

-- Add some regular promo codes that can be used directly
INSERT INTO promo_codes (
    code, 
    discount_type, 
    discount_value, 
    min_order_amount, 
    max_uses, 
    is_active
) VALUES 
(
    'WELCOME10', 
    'percentage', 
    10, 
    200, 
    500, 
    true
),
(
    'STUDENT50', 
    'fixed', 
    50, 
    300, 
    300, 
    true
),
(
    'FAMILY20', 
    'percentage', 
    20, 
    800, 
    100, 
    true
)
ON CONFLICT (code) DO NOTHING;
