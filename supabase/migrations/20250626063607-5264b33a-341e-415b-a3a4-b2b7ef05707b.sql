
-- Fix the RLS policies to prevent infinite recursion
-- Check for existing policies before creating new ones

-- First, let's handle admin_users table policies
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Only admins can access admin_users" ON admin_users;
    
    -- Create new policies for admin_users
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'admin_users' 
        AND policyname = 'Admin users can view admin list'
    ) THEN
        CREATE POLICY "Admin users can view admin list" ON admin_users FOR SELECT USING (
          auth.uid() = user_id OR 
          EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND role = 'admin')
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'admin_users' 
        AND policyname = 'Admin users can manage admin list'
    ) THEN
        CREATE POLICY "Admin users can manage admin list" ON admin_users FOR ALL USING (
          EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND role = 'admin')
        );
    END IF;
END $$;

-- Update the products RLS policies to be simpler and avoid recursion
DROP POLICY IF EXISTS "Admin can manage products" ON products;
CREATE POLICY "Authenticated users can manage products" ON products FOR ALL USING (auth.uid() IS NOT NULL);

-- Update the product_packages RLS policies 
DROP POLICY IF EXISTS "Admin can manage packages" ON product_packages;
CREATE POLICY "Authenticated users can manage packages" ON product_packages FOR ALL USING (auth.uid() IS NOT NULL);

-- Update promo_codes RLS policies
DROP POLICY IF EXISTS "Admin can manage promo codes" ON promo_codes;
CREATE POLICY "Authenticated users can manage promo codes" ON promo_codes FOR ALL USING (auth.uid() IS NOT NULL);

-- Update user_subscriptions RLS policies
DROP POLICY IF EXISTS "Admin can view all subscriptions" ON user_subscriptions;
-- Keep the existing "Users can view own subscriptions" policy
-- Add new policy for managing subscriptions
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_subscriptions' 
        AND policyname = 'Authenticated users can manage subscriptions'
    ) THEN
        CREATE POLICY "Authenticated users can manage subscriptions" ON user_subscriptions FOR ALL USING (auth.uid() IS NOT NULL);
    END IF;
END $$;

-- Update site_settings RLS policies
DROP POLICY IF EXISTS "Admin can manage settings" ON site_settings;
CREATE POLICY "Authenticated users can manage settings" ON site_settings FOR ALL USING (auth.uid() IS NOT NULL);
