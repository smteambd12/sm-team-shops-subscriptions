
-- Fix the infinite recursion in admin_users RLS policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admin users can view admin list" ON admin_users;
DROP POLICY IF EXISTS "Admin users can manage admin list" ON admin_users;

-- Create a security definer function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create new policies using the security definer function
CREATE POLICY "Users can view their own admin record" 
  ON admin_users 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all admin records" 
  ON admin_users 
  FOR SELECT 
  USING (public.is_current_user_admin());

CREATE POLICY "Admins can manage admin records" 
  ON admin_users 
  FOR ALL 
  USING (public.is_current_user_admin());
