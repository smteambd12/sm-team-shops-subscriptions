
import React from 'react';
import { Gift, TrendingUp, Star, Zap, Heart, Award } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import CompactOfferCard from '../components/CompactOfferCard';
import PopularProductCard from '../components/PopularProductCard';
import HorizontalProductSlider from '../components/HorizontalProductSlider';
import { useProducts } from '../hooks/useProducts';
import { useOfferProducts } from '../hooks/useOfferProducts';
import { usePopularProducts } from '../hooks/usePopularProducts';
import { useSiteSettings } from '../hooks/useSiteSettings';

const Home = () => {
  const { products, loading: productsLoading } = useProducts();
  const { offerProducts, loading: offersLoading } = useOfferProducts();
  const { popularProducts, loading: popularLoading } = usePopularProducts();
  const { settings } = useSiteSettings();

  console.log('Home page data:', {
    products: products.length,
    offerProducts: offerProducts.length,
    popularProducts: popularProducts.length
  });

  if (productsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white py-12 sm:py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <Zap className="w-8 h-8 sm:w-12 sm:h-12 mr-2 sm:mr-4 text-yellow-300" />
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold">
              স্বাগতম
            </h1>
          </div>
          <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed">
            আমাদের প্রিমিয়াম ডিজিটাল পণ্যের সাথে আপনার ব্যবসা এবং দক্ষতা উন্নত করুন
          </p>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-6">
            <div className="flex items-center text-sm sm:text-base">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-red-300" />
              ১০০০+ সন্তুষ্ট গ্রাহক
            </div>
            <div className="flex items-center text-sm sm:text-base">
              <Award className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-yellow-300" />
              বিশ্বস্ত সেবা
            </div>
            <div className="flex items-center text-sm sm:text-base">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-yellow-300" />
              ৫★ রেটিং
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 sm:py-12 space-y-12 sm:space-y-16">
        {/* Special Offers Section */}
        {settings.offer_products_enabled && offerProducts.length > 0 && (
          <section>
            <HorizontalProductSlider
              title="🔥 বিশেষ অফার"
              subtitle="সীমিত সময়ের জন্য বিশেষ ছাড়ে পান"
              icon={<Gift className="w-8 h-8 text-orange-500" />}
            >
              {offerProducts.map((product) => (
                <CompactOfferCard
                  key={product.id}
                  product={product}
                />
              ))}
            </HorizontalProductSlider>
          </section>
        )}

        {/* Popular Products Section */}
        {settings.popular_products_enabled && popularProducts.length > 0 && (
          <section>
            <HorizontalProductSlider
              title="⭐ জনপ্রিয় পণ্য"
              subtitle="আমাদের সবচেয়ে পছন্দের পণ্যসমূহ"
              icon={<TrendingUp className="w-8 h-8 text-purple-500" />}
            >
              {popularProducts.map((product) => (
                <PopularProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </HorizontalProductSlider>
          </section>
        )}

        {/* All Products Section */}
        <section>
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              আমাদের সকল পণ্য
            </h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
              উন্নত মানের ডিজিটাল সমাধান যা আপনার প্রয়োজন মেটাবে
            </p>
          </div>
          
          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">কোন পণ্য পাওয়া যায়নি</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Home;
