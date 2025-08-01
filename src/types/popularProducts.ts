
export interface PopularProduct {
  id: string;
  product_id: string;
  title: string;
  description: string | null;
  media_type: 'image' | 'video';
  media_url: string;
  thumbnail_url: string | null;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OfferProduct {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  discount_percentage: number | null;
  original_price: number | null;
  offer_price: number | null;
  is_active: boolean;
  priority: number;
  shareable_slug: string | null;
  created_at: string;
  updated_at: string;
  offer_items?: OfferProductItem[];
}

export interface OfferProductItem {
  id: string;
  offer_product_id: string;
  product_id: string;
  package_id: string;
  quantity: number;
  created_at: string;
}
