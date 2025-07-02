
-- AI features management table
CREATE TABLE public.ai_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT NOT NULL,
  feature_url TEXT,
  is_active BOOLEAN DEFAULT true,
  credits_required INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User credits table
CREATE TABLE public.user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  credits_balance INTEGER DEFAULT 0,
  total_purchased INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Credit packages table
CREATE TABLE public.credit_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  credits_amount INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  discount_percentage INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Premium plans table
CREATE TABLE public.premium_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration_months INTEGER NOT NULL,
  features TEXT[],
  monthly_credits INTEGER DEFAULT 0,
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User subscriptions table (enhanced)
CREATE TABLE public.user_premium_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.premium_plans(id),
  status TEXT DEFAULT 'active',
  starts_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Bengali calendar and holidays table
CREATE TABLE public.bengali_holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  bengali_date TEXT,
  name TEXT NOT NULL,
  type TEXT, -- 'national', 'religious', 'cultural'
  description TEXT,
  is_government_holiday BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.ai_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_premium_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bengali_holidays ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_features (public read, admin write)
CREATE POLICY "ai_features_public_read" ON public.ai_features
  FOR SELECT USING (is_active = true);

CREATE POLICY "ai_features_admin_all" ON public.ai_features
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for user_credits
CREATE POLICY "user_credits_own" ON public.user_credits
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for credit_packages (public read)
CREATE POLICY "credit_packages_public_read" ON public.credit_packages
  FOR SELECT USING (is_active = true);

CREATE POLICY "credit_packages_admin_all" ON public.credit_packages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for premium_plans (public read)
CREATE POLICY "premium_plans_public_read" ON public.premium_plans
  FOR SELECT USING (is_active = true);

CREATE POLICY "premium_plans_admin_all" ON public.premium_plans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for user_premium_subscriptions
CREATE POLICY "user_subscriptions_own" ON public.user_premium_subscriptions
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for bengali_holidays (public read)
CREATE POLICY "bengali_holidays_public_read" ON public.bengali_holidays
  FOR SELECT USING (true);

CREATE POLICY "bengali_holidays_admin_all" ON public.bengali_holidays
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- Insert sample AI features
INSERT INTO public.ai_features (name, description, icon, category, feature_url, credits_required) VALUES
('AI টেক্সট জেনারেটর', 'যেকোনো বিষয়ে উন্নত মানের টেক্সট তৈরি করুন', 'FileText', 'generator', '/ai/text-generator', 2),
('AI ইমেজ জেনারেটর', 'টেক্সট থেকে সুন্দর ছবি তৈরি করুন', 'Image', 'generator', '/ai/image-generator', 5),
('বাংলাদেশী ক্যালেন্ডার', 'বাংলা ও ইংরেজি ক্যালেন্ডার এবং ছুটির দিন', 'Calendar', 'calendar', '/ai/bengali-calendar', 1),
('AI চ্যাটবট', 'স্মার্ট AI চ্যাটবট দিয়ে যেকোনো প্রশ্নের উত্তর পান', 'MessageCircle', 'assistant', '/ai/chatbot', 1),
('বয়স ক্যালকুলেটর', 'সঠিক বয়স এবং জন্মদিনের তথ্য জানুন', 'Calculator', 'calculator', '/ai/age-calculator', 1),
('AI অনুবাদক', 'বাংলা ও ইংরেজি ভাষায় অনুবাদ করুন', 'Languages', 'translator', '/ai/translator', 2);

-- Insert sample credit packages
INSERT INTO public.credit_packages (name, credits_amount, price, discount_percentage) VALUES
('স্টার্টার প্যাক', 100, 500.00, 0),
('প্রো প্যাক', 300, 1200.00, 20),
('আল্টিমেট প্যাক', 1000, 3000.00, 40);

-- Insert sample premium plans
INSERT INTO public.premium_plans (name, description, price, duration_months, features, monthly_credits, is_popular) VALUES
('বেসিক প্ল্যান', 'শুরুর জন্য আদর্শ', 800.00, 1, ARRAY['মাসিক ২০০ ক্রেডিট', 'সব AI ফিচার অ্যাক্সেস', 'ইমেইল সাপোর্ট'], 200, false),
('প্রিমিয়াম প্ল্যান', 'সবচেয়ে জনপ্রিয়', 2000.00, 3, ARRAY['মাসিক ৮০০ ক্রেডিট', 'সব AI ফিচার অ্যাক্সেস', 'প্রায়োরিটি সাপোর্ট', 'অসীমিত প্রজেক্ট'], 800, true),
('এন্টারপ্রাইজ প্ল্যান', 'ব্যবসার জন্য সেরা', 5000.00, 6, ARRAY['মাসিক ২৫০০ ক্রেডিট', 'সব AI ফিচার অ্যাক্সেস', '২৪/৭ সাপোর্ট', 'কাস্টম ইন্টিগ্রেশন'], 2500, false);

-- Insert sample Bengali holidays for 2025
INSERT INTO public.bengali_holidays (date, bengali_date, name, type, description, is_government_holiday) VALUES
('2025-02-21', '৮ ফাল্গুন ১৪৩১', 'আন্তর্জাতিক মাতৃভাষা দিবস', 'national', 'ভাষা শহীদদের স্মরণে', true),
('2025-03-17', '৩ চৈত্র ১৪৩১', 'বঙ্গবন্ধুর জন্মদিন', 'national', 'জাতির পিতার জন্মবার্ষিকী', true),
('2025-03-26', '১২ চৈত্র ১৪৩১', 'স্বাধীনতা দিবস', 'national', 'বাংলাদেশের স্বাধীনতা দিবস', true),
('2025-04-14', '১ বৈশাখ ১৪৩২', 'পহেলা বৈশাখ', 'cultural', 'বাংলা নববর্ষ', true),
('2025-05-01', '১৮ বৈশাখ ১৪৩২', 'মে দিবস', 'national', 'আন্তর্জাতিক শ্রমিক দিবস', true),
('2025-08-15', '৩১ শ্রাবণ ১৪৩২', 'জাতীয় শোক দিবস', 'national', 'বঙ্গবন্ধু হত্যাকাণ্ড দিবস', true),
('2025-12-16', '১ পৌষ ১৪৩২', 'বিজয় দিবস', 'national', 'মুক্তিযুদ্ধের বিজয় দিবস', true);
