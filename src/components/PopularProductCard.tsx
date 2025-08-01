
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Share2, Eye } from 'lucide-react';
import { PopularProduct } from '@/types/popularProducts';
import { toast } from 'sonner';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useNavigate } from 'react-router-dom';

interface PopularProductCardProps {
  product: PopularProduct;
}

const PopularProductCard = ({ product }: PopularProductCardProps) => {
  const { settings } = useSiteSettings();
  const navigate = useNavigate();

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (settings.enable_product_sharing) {
      const shareUrl = `${window.location.origin}/#/product/${product.product_id}`;
      navigator.clipboard.writeText(shareUrl);
      toast.success('পণ্যের লিঙ্ক কপি হয়েছে!');
    }
  };

  const handleViewProduct = () => {
    navigate(`/product/${product.product_id}`);
  };

  return (
    <Card 
      className="group cursor-pointer hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/50 backdrop-blur-sm min-w-[280px] transform hover:scale-105"
      onClick={handleViewProduct}
    >
      <CardContent className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          {product.media_type === 'video' ? (
            <div className="relative group">
              <video
                src={product.media_url}
                poster={product.thumbnail_url || undefined}
                className="w-full h-56 object-cover transition-transform group-hover:scale-110"
                muted
                loop
                onMouseEnter={(e) => e.currentTarget.play()}
                onMouseLeave={(e) => e.currentTarget.pause()}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-2xl transform scale-75 group-hover:scale-100 transition-transform">
                  <Play className="w-6 h-6 text-purple-600 ml-1" />
                </div>
              </div>
              <div className="absolute top-3 left-3">
                <Badge className="bg-red-500 text-white animate-pulse shadow-lg">
                  🎬 ভিডিও
                </Badge>
              </div>
            </div>
          ) : (
            <div className="relative overflow-hidden">
              <img
                src={product.media_url}
                alt={product.title}
                className="w-full h-56 object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
            </div>
          )}
          
          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <Badge 
              variant="secondary" 
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg border-0"
            >
              ⭐ জনপ্রিয়
            </Badge>
            {settings.enable_product_sharing && (
              <button
                onClick={handleShare}
                className="w-10 h-10 bg-white/95 rounded-full flex items-center justify-center hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110"
              >
                <Share2 className="w-4 h-4 text-purple-600" />
              </button>
            )}
          </div>
          
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="flex items-center gap-1 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
              <Eye className="w-4 h-4" />
              <span>বিস্তারিত দেখুন</span>
            </div>
          </div>
        </div>
        
        <div className="p-5">
          <h3 className="font-bold text-lg text-gray-900 mb-3 line-clamp-2 leading-tight group-hover:text-purple-700 transition-colors">
            {product.title}
          </h3>
          {product.description && (
            <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed mb-4">
              {product.description}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600 font-medium">সক্রিয়</span>
            </div>
            <div className="text-xs text-gray-500">
              প্রাধিকার: {product.priority}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PopularProductCard;
