
-- Create user coins table
CREATE TABLE public.user_coins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  total_coins INTEGER NOT NULL DEFAULT 0,
  earned_coins INTEGER NOT NULL DEFAULT 0,
  spent_coins INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create coin transactions table
CREATE TABLE public.coin_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earned', 'spent', 'admin_added', 'admin_removed')),
  source TEXT, -- 'login', 'purchase', 'admin', 'promo_purchase', etc.
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create purchasable promo codes table
CREATE TABLE public.purchasable_promo_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL,
  coin_cost INTEGER NOT NULL,
  min_order_amount NUMERIC DEFAULT 0,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user purchased promo codes table
CREATE TABLE public.user_promo_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  promo_code_id UUID REFERENCES purchasable_promo_codes(id) NOT NULL,
  code TEXT NOT NULL,
  is_used BOOLEAN DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE,
  order_id UUID,
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user activity tracking table
CREATE TABLE public.user_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  activity_type TEXT NOT NULL, -- 'login', 'page_view', 'product_view', 'cart_add', 'order_placed', etc.
  activity_data JSONB,
  coins_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for user_coins
ALTER TABLE public.user_coins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own coins" 
  ON public.user_coins 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all coins" 
  ON public.user_coins 
  FOR ALL 
  USING (is_current_user_admin());

-- Add RLS policies for coin_transactions
ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own coin transactions" 
  ON public.coin_transactions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all coin transactions" 
  ON public.coin_transactions 
  FOR ALL 
  USING (is_current_user_admin());

-- Add RLS policies for purchasable_promo_codes
ALTER TABLE public.purchasable_promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active purchasable promo codes" 
  ON public.purchasable_promo_codes 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Admins can manage purchasable promo codes" 
  ON public.purchasable_promo_codes 
  FOR ALL 
  USING (is_current_user_admin());

-- Add RLS policies for user_promo_codes
ALTER TABLE public.user_promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own purchased promo codes" 
  ON public.user_promo_codes 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert user promo codes" 
  ON public.user_promo_codes 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admins can manage all user promo codes" 
  ON public.user_promo_codes 
  FOR ALL 
  USING (is_current_user_admin());

-- Add RLS policies for user_activities
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activities" 
  ON public.user_activities 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert user activities" 
  ON public.user_activities 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admins can view all activities" 
  ON public.user_activities 
  FOR ALL 
  USING (is_current_user_admin());

-- Create function to award coins
CREATE OR REPLACE FUNCTION public.award_coins(
  p_user_id UUID,
  p_amount INTEGER,
  p_source TEXT,
  p_description TEXT DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert coin transaction
  INSERT INTO coin_transactions (user_id, amount, transaction_type, source, description)
  VALUES (p_user_id, p_amount, 'earned', p_source, p_description);
  
  -- Update or create user coins record
  INSERT INTO user_coins (user_id, total_coins, earned_coins)
  VALUES (p_user_id, p_amount, p_amount)
  ON CONFLICT (user_id) DO UPDATE SET
    total_coins = user_coins.total_coins + p_amount,
    earned_coins = user_coins.earned_coins + p_amount,
    updated_at = now();
END;
$$;

-- Create function to spend coins
CREATE OR REPLACE FUNCTION public.spend_coins(
  p_user_id UUID,
  p_amount INTEGER,
  p_source TEXT,
  p_description TEXT DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_coins INTEGER;
BEGIN
  -- Get current coin balance
  SELECT total_coins INTO current_coins
  FROM user_coins
  WHERE user_id = p_user_id;
  
  -- Check if user has enough coins
  IF current_coins IS NULL OR current_coins < p_amount THEN
    RETURN FALSE;
  END IF;
  
  -- Insert coin transaction
  INSERT INTO coin_transactions (user_id, amount, transaction_type, source, description)
  VALUES (p_user_id, -p_amount, 'spent', p_source, p_description);
  
  -- Update user coins
  UPDATE user_coins SET
    total_coins = total_coins - p_amount,
    spent_coins = spent_coins + p_amount,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  RETURN TRUE;
END;
$$;

-- Create function to purchase promo code with coins
CREATE OR REPLACE FUNCTION public.purchase_promo_code(
  p_user_id UUID,
  p_promo_code_id UUID
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  promo_record RECORD;
  current_coins INTEGER;
  new_code TEXT;
  result JSON;
BEGIN
  -- Get promo code details
  SELECT * INTO promo_record
  FROM purchasable_promo_codes
  WHERE id = p_promo_code_id AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Promo code not found or inactive');
  END IF;
  
  -- Check if max uses reached
  IF promo_record.max_uses IS NOT NULL AND promo_record.used_count >= promo_record.max_uses THEN
    RETURN json_build_object('success', false, 'message', 'Promo code usage limit reached');
  END IF;
  
  -- Get user's coin balance
  SELECT total_coins INTO current_coins
  FROM user_coins
  WHERE user_id = p_user_id;
  
  -- Check if user has enough coins
  IF current_coins IS NULL OR current_coins < promo_record.coin_cost THEN
    RETURN json_build_object('success', false, 'message', 'Insufficient coins');
  END IF;
  
  -- Generate unique code for user
  new_code := promo_record.code || '_' || EXTRACT(EPOCH FROM now())::INTEGER;
  
  -- Spend coins
  IF NOT spend_coins(p_user_id, promo_record.coin_cost, 'promo_purchase', 'Purchased promo code: ' || promo_record.title) THEN
    RETURN json_build_object('success', false, 'message', 'Failed to spend coins');
  END IF;
  
  -- Add promo code to user's collection
  INSERT INTO user_promo_codes (user_id, promo_code_id, code)
  VALUES (p_user_id, p_promo_code_id, new_code);
  
  -- Update usage count
  UPDATE purchasable_promo_codes SET
    used_count = used_count + 1,
    updated_at = now()
  WHERE id = p_promo_code_id;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Promo code purchased successfully',
    'code', new_code
  );
END;
$$;

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_coins_updated_at BEFORE UPDATE ON user_coins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchasable_promo_codes_updated_at BEFORE UPDATE ON purchasable_promo_codes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
