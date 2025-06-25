
-- Check which policies already exist and create only the missing ones

-- For orders table - only create policies that don't exist
DO $$
BEGIN
    -- Check if "Users can view their own orders" policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'orders' 
        AND policyname = 'Users can view their own orders'
    ) THEN
        CREATE POLICY "Users can view their own orders" 
          ON public.orders 
          FOR SELECT 
          USING (auth.uid() = user_id);
    END IF;

    -- Check if "Users can create their own orders" policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'orders' 
        AND policyname = 'Users can create their own orders'
    ) THEN
        CREATE POLICY "Users can create their own orders" 
          ON public.orders 
          FOR INSERT 
          WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Check if "Users can update their own orders" policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'orders' 
        AND policyname = 'Users can update their own orders'
    ) THEN
        CREATE POLICY "Users can update their own orders" 
          ON public.orders 
          FOR UPDATE 
          USING (auth.uid() = user_id)
          WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- For order_items table
DO $$
BEGIN
    -- Check if "Users can view their own order items" policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'order_items' 
        AND policyname = 'Users can view their own order items'
    ) THEN
        CREATE POLICY "Users can view their own order items" 
          ON public.order_items 
          FOR SELECT 
          USING (
            EXISTS (
              SELECT 1 FROM public.orders 
              WHERE orders.id = order_items.order_id 
              AND orders.user_id = auth.uid()
            )
          );
    END IF;

    -- Check if "Users can create their own order items" policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'order_items' 
        AND policyname = 'Users can create their own order items'
    ) THEN
        CREATE POLICY "Users can create their own order items" 
          ON public.order_items 
          FOR INSERT 
          WITH CHECK (
            EXISTS (
              SELECT 1 FROM public.orders 
              WHERE orders.id = order_items.order_id 
              AND orders.user_id = auth.uid()
            )
          );
    END IF;
END $$;

-- For favorites table
DO $$
BEGIN
    -- Check if "Users can manage their own favorites" policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'favorites' 
        AND policyname = 'Users can manage their own favorites'
    ) THEN
        CREATE POLICY "Users can manage their own favorites" 
          ON public.favorites 
          FOR ALL 
          USING (auth.uid() = user_id)
          WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- For profiles table
DO $$
BEGIN
    -- Check if "Users can manage their own profile" policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can manage their own profile'
    ) THEN
        CREATE POLICY "Users can manage their own profile" 
          ON public.profiles 
          FOR ALL 
          USING (auth.uid() = user_id)
          WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Enable RLS on all tables (this is idempotent)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
