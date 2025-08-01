
-- Create popular_products table for featured/popular products
CREATE TABLE public.popular_products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id text NOT NULL,
  title text NOT NULL,
  description text,
  media_type text NOT NULL DEFAULT 'image', -- 'image' or 'video'
  media_url text NOT NULL,
  thumbnail_url text, -- for video thumbnails
  priority integer NOT NULL DEFAULT 0, -- for ordering
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create offer_products table for bundled/offer products
CREATE TABLE public.offer_products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  image_url text,
  discount_percentage integer DEFAULT 0,
  original_price numeric,
  offer_price numeric,
  is_active boolean NOT NULL DEFAULT true,
  priority integer NOT NULL DEFAULT 0,
  shareable_slug text UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create offer_product_items table for individual products in an offer
CREATE TABLE public.offer_product_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  offer_product_id uuid NOT NULL,
  product_id text NOT NULL,
  package_id text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add foreign key constraint
ALTER TABLE public.offer_product_items 
ADD CONSTRAINT fk_offer_product_items_offer_product_id 
FOREIGN KEY (offer_product_id) REFERENCES public.offer_products(id) ON DELETE CASCADE;

-- Enable RLS for all tables
ALTER TABLE public.popular_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_product_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for popular_products
CREATE POLICY "Anyone can view active popular products" 
  ON public.popular_products 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage popular products" 
  ON public.popular_products 
  FOR ALL 
  USING (auth.uid() IS NOT NULL);

-- RLS policies for offer_products
CREATE POLICY "Anyone can view active offer products" 
  ON public.offer_products 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage offer products" 
  ON public.offer_products 
  FOR ALL 
  USING (auth.uid() IS NOT NULL);

-- RLS policies for offer_product_items
CREATE POLICY "Anyone can view offer product items" 
  ON public.offer_product_items 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can manage offer product items" 
  ON public.offer_product_items 
  FOR ALL 
  USING (auth.uid() IS NOT NULL);

-- Create indexes for better performance
CREATE INDEX idx_popular_products_priority ON public.popular_products(priority DESC, created_at DESC);
CREATE INDEX idx_popular_products_active ON public.popular_products(is_active);
CREATE INDEX idx_offer_products_priority ON public.offer_products(priority DESC, created_at DESC);
CREATE INDEX idx_offer_products_active ON public.offer_products(is_active);
CREATE INDEX idx_offer_products_slug ON public.offer_products(shareable_slug);
CREATE INDEX idx_offer_product_items_offer_id ON public.offer_product_items(offer_product_id);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_popular_products_updated_at 
  BEFORE UPDATE ON public.popular_products 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_offer_products_updated_at 
  BEFORE UPDATE ON public.offer_products 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
