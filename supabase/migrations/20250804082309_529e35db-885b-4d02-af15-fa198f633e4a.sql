
-- Update the purchase_promo_code function to mark user_promo_codes as used after order completion
CREATE OR REPLACE FUNCTION validate_user_promo_code(p_code text, p_order_amount numeric, p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_promo_record RECORD;
    promo_record RECORD;
    discount_amount NUMERIC := 0;
    result JSON;
BEGIN
    -- Get user's purchased promo code that hasn't been used
    SELECT up.*, pp.* INTO user_promo_record
    FROM user_promo_codes up
    JOIN purchasable_promo_codes pp ON up.promo_code_id = pp.id
    WHERE up.code = p_code 
      AND up.user_id = p_user_id
      AND up.is_used = false;
    
    IF NOT FOUND THEN
        result := json_build_object(
            'valid', false,
            'message', 'প্রোমো কোড অবৈধ বা ইতিমধ্যে ব্যবহৃত'
        );
        RETURN result;
    END IF;
    
    -- Check minimum order amount
    IF user_promo_record.min_order_amount > 0 AND p_order_amount < user_promo_record.min_order_amount THEN
        result := json_build_object(
            'valid', false,
            'message', 'ন্যূনতম অর্ডার পরিমাণ ৳' || user_promo_record.min_order_amount
        );
        RETURN result;
    END IF;
    
    -- Calculate discount
    IF user_promo_record.discount_type = 'percentage' THEN
        discount_amount := (p_order_amount * user_promo_record.discount_value) / 100;
    ELSE
        discount_amount := user_promo_record.discount_value;
    END IF;
    
    -- Ensure discount doesn't exceed order amount
    IF discount_amount > p_order_amount THEN
        discount_amount := p_order_amount;
    END IF;
    
    result := json_build_object(
        'valid', true,
        'discount_amount', discount_amount,
        'code', user_promo_record.code,
        'user_promo_id', user_promo_record.id
    );
    
    RETURN result;
END;
$$;

-- Function to mark promo code as used
CREATE OR REPLACE FUNCTION mark_promo_code_used(p_code text, p_user_id uuid, p_order_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE user_promo_codes 
    SET is_used = true, 
        used_at = now(),
        order_id = p_order_id
    WHERE code = p_code 
      AND user_id = p_user_id 
      AND is_used = false;
END;
$$;

-- Function to award coins when order is confirmed by admin
CREATE OR REPLACE FUNCTION award_coins_for_confirmed_order(p_order_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    order_record RECORD;
    total_coins INTEGER := 0;
    item_record RECORD;
BEGIN
    -- Get order details
    SELECT * INTO order_record FROM orders WHERE id = p_order_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order not found';
    END IF;
    
    -- Calculate total coins (10 coins per product quantity)
    FOR item_record IN 
        SELECT * FROM order_items WHERE order_id = p_order_id
    LOOP
        total_coins := total_coins + (item_record.quantity * 10);
    END LOOP;
    
    -- Award coins to user
    IF total_coins > 0 THEN
        PERFORM award_coins(
            order_record.user_id, 
            total_coins, 
            'order_confirmed', 
            'অর্ডার কনফার্ম হওয়ার জন্য ' || total_coins || ' কয়েন পেয়েছেন'
        );
        
        -- Log user activity
        INSERT INTO user_activities (user_id, activity_type, activity_data, coins_earned)
        VALUES (
            order_record.user_id,
            'order_confirmed',
            json_build_object(
                'order_id', p_order_id,
                'total_amount', order_record.total_amount,
                'coins_earned', total_coins
            ),
            total_coins
        );
    END IF;
END;
$$;

-- Update the confirm_order_and_create_subscriptions function to award coins
CREATE OR REPLACE FUNCTION confirm_order_and_create_subscriptions(order_uuid uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
    subscription_count integer;
BEGIN
    -- Create subscriptions from the order
    PERFORM create_subscription_from_order(order_uuid);
    
    -- Award coins for confirmed order
    PERFORM award_coins_for_confirmed_order(order_uuid);
    
    -- Count created subscriptions
    SELECT COUNT(*) INTO subscription_count
    FROM user_subscriptions
    WHERE order_id = order_uuid;
    
    -- Return success result
    result := json_build_object(
        'success', true,
        'message', 'Order confirmed, subscriptions created, and coins awarded',
        'subscription_count', subscription_count,
        'order_id', order_uuid
    );
    
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        -- Return error result
        result := json_build_object(
            'success', false,
            'message', SQLERRM,
            'order_id', order_uuid
        );
        RETURN result;
END;
$$;

-- Create achievements table for user achievements
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_type TEXT NOT NULL,
    achievement_name TEXT NOT NULL,
    achievement_description TEXT,
    achievement_icon TEXT,
    points_earned INTEGER DEFAULT 0,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for user_achievements
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_achievements
CREATE POLICY "Users can view their own achievements" 
ON public.user_achievements FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert achievements" 
ON public.user_achievements FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all achievements" 
ON public.user_achievements FOR ALL 
USING (is_current_user_admin());

-- Function to check and award achievements
CREATE OR REPLACE FUNCTION check_and_award_achievements(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    coin_balance INTEGER;
    order_count INTEGER;
    promo_codes_purchased INTEGER;
BEGIN
    -- Get user stats
    SELECT COALESCE(total_coins, 0) INTO coin_balance FROM user_coins WHERE user_id = p_user_id;
    SELECT COUNT(*) INTO order_count FROM orders WHERE user_id = p_user_id AND status = 'confirmed';
    SELECT COUNT(*) INTO promo_codes_purchased FROM user_promo_codes WHERE user_id = p_user_id;
    
    -- First Order Achievement
    IF order_count = 1 AND NOT EXISTS (SELECT 1 FROM user_achievements WHERE user_id = p_user_id AND achievement_type = 'first_order') THEN
        INSERT INTO user_achievements (user_id, achievement_type, achievement_name, achievement_description, achievement_icon, points_earned)
        VALUES (p_user_id, 'first_order', 'প্রথম অর্ডার', 'আপনার প্রথম অর্ডার সম্পূর্ণ হয়েছে!', '🎉', 50);
    END IF;
    
    -- Coin Collector Achievements
    IF coin_balance >= 100 AND NOT EXISTS (SELECT 1 FROM user_achievements WHERE user_id = p_user_id AND achievement_type = 'coin_collector_100') THEN
        INSERT INTO user_achievements (user_id, achievement_type, achievement_name, achievement_description, achievement_icon, points_earned)
        VALUES (p_user_id, 'coin_collector_100', 'কয়েন সংগ্রাহক', '১০০ কয়েন সংগ্রহ করেছেন!', '🪙', 25);
    END IF;
    
    IF coin_balance >= 500 AND NOT EXISTS (SELECT 1 FROM user_achievements WHERE user_id = p_user_id AND achievement_type = 'coin_collector_500') THEN
        INSERT INTO user_achievements (user_id, achievement_type, achievement_name, achievement_description, achievement_icon, points_earned)
        VALUES (p_user_id, 'coin_collector_500', 'কয়েন মাস্টার', '৫০০ কয়েন সংগ্রহ করেছেন!', '👑', 100);
    END IF;
    
    -- Promo Code Achievements
    IF promo_codes_purchased >= 1 AND NOT EXISTS (SELECT 1 FROM user_achievements WHERE user_id = p_user_id AND achievement_type = 'first_promo') THEN
        INSERT INTO user_achievements (user_id, achievement_type, achievement_name, achievement_description, achievement_icon, points_earned)
        VALUES (p_user_id, 'first_promo', 'প্রোমো হান্টার', 'প্রথম প্রোমো কোড কিনেছেন!', '🎫', 30);
    END IF;
END;
$$;

-- Trigger to check achievements after coin transactions
CREATE OR REPLACE FUNCTION trigger_achievement_check()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    PERFORM check_and_award_achievements(NEW.user_id);
    RETURN NEW;
END;
$$;

-- Create trigger for coin transactions
DROP TRIGGER IF EXISTS check_achievements_after_coins ON coin_transactions;
CREATE TRIGGER check_achievements_after_coins
    AFTER INSERT ON coin_transactions
    FOR EACH ROW
    EXECUTE FUNCTION trigger_achievement_check();
