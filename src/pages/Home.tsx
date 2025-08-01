import React, { useState } from 'react';
import ProductCard from '@/components/ProductCard';
import PopularProductCard from '@/components/PopularProductCard';
import OfferProductCard from '@/components/OfferProductCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Star, Gift } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { usePopularProducts } from '@/hooks/usePopularProducts';
import { useOfferProducts } from '@/hooks/useOfferProducts';

const statCards = [
  { title: 'সাপোর্ট টিকিট', value: '1,200+', color: 'text-purple-600' },
  { title: 'ডিজিটাল কোর্স', value: '৫০+ কোর্স', color: 'text-pink-600' },
  { title: 'ডেলিভারি টাইম', value: 'তাৎক্ষণিক', color: 'text-green-600' },
  { title: 'অ্যাপ সার্ভিস', value: '৩০+ অ্যাপ', color: 'text-yellow-600' },
  { title: 'ট্রাস্ট রেটিং', value: '95%', color: 'text-blue-600' },
  { title: 'ওয়েব সাবস্ক্রিপশন', value: '১০০+', color: 'text-indigo-600' },
];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return '🌤️ Good Morning';
  if (hour >= 12 && hour < 17) return '☀️ Good Afternoon';
  if (hour >= 17 && hour < 21) return '🌆 Good Evening';
  return '🌙 Good Night';
};

const Home = () => {
  const { products, loading, error } = useProducts();
  const { popularProducts, loading: popularLoading } = usePopularProducts();
  const { offerProducts, loading: offerLoading } = useOfferProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const greeting = getGreeting();

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryLabel = (category: string) => {
    const labels = {
      web: 'ওয়েব সাবস্ক্রিপশন',
      mobile: 'মোবাইল অ্যাপ',
      tutorial: 'টিউটোরিয়াল/কোর্স'
    };
    return labels[category as keyof typeof labels] || category;
  };

  const categoryStats = products.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="container mx-auto px-2 sm:px-4 py-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-2 sm:px-4 py-8 text-center text-red-600">
        <p>পণ্য লোড করতে সমস্যা হয়েছে। পেজ রিফ্রেশ করুন।</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#f8f9ff] pt-6 pb-8 sm:pt-8 sm:pb-10">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row justify-between items-center relative z-10">
          
          {/* Left Text */}
          <div className="max-w-xl text-center lg:text-left mb-10 lg:mb-0 space-y-4">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 leading-snug tracking-wide space-y-1 sm:space-y-2">
              <span className="block text-indigo-600 drop-shadow-lg animate-pulse">{greeting}</span>
              <span className="block text-xl sm:text-3xl text-blue-700 font-bold underline decoration-indigo-400 decoration-2">
                ডিজিটাল সেবা সহজ করে
              </span>
            </h1>
            <p className="text-gray-700 text-sm sm:text-base leading-snug sm:leading-relaxed">
              আমরা বিশ্বাস করি আপনার ডিজিটাল প্রয়োজনে 
              <span className="font-semibold text-indigo-600">বিশ্বাসযোগ্যতা</span>, 
              <span className="font-semibold text-pink-600">গতি</span> এবং 
              <span className="font-semibold text-green-600">মূল্য</span> – সবকিছু একসাথে দরকার।
            </p>
            <div className="flex flex-wrap mt-3 gap-2 justify-center lg:justify-start">
              <Badge variant="secondary">৫০% পর্যন্ত ছাড়</Badge>
              <Badge variant="secondary">তাৎক্ষণিক ডেলিভারি</Badge>
              <Badge variant="secondary">২৪/৭ সাপোর্ট</Badge>
            </div>
          </div>

          {/* Right Image with Stat Cards */}
          <div className="relative w-full lg:w-1/2 flex justify-center items-center">
            <img
              src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiFaskoHaK271IdQpGdmPhPDA1TK7U69kmczdhp-BTugHt5eQPkc5MODaM0rfsIdCnMQ3LyG2zoTJiq_LLJKo6i4soD67m1L9eB4IxyhLlcJ_gBFgMFbWfjYC07WhWjaXrXsPPZLb-x_oPYs8oh6PEp1_4e34Jo_QgGF3hk8Rh4fTCRjSO_pD1_2eaXEljm/s1600/Untitled%20design%20%2830%29.png"
              alt="Hero Character"
              className="w-[240px] sm:w-[300px] md:w-[340px] z-10"
            />

            {/* Stat Cards */}
            {statCards.map((card, index) => {
              let position = '';
              if (index === 0) position = 'top-0 left-6';
              else if (index === 1) position = 'top-2 right-1 sm:top-6 sm:right-2';
              else if (index === 2) position = 'top-28 left-0';
              else if (index === 3) position = 'bottom-28 right-2';
              else if (index === 4) position = 'bottom-0 left-10 sm:bottom-8';
              else if (index === 5) position = 'bottom-0 right-12';

              return (
                <div
                  key={index}
                  className={`absolute ${position} bg-white shadow-md border rounded-lg px-3 py-2 text-sm font-medium transform transition-all duration-500 hover:scale-105 animate-fade-in-up z-20`}
                >
                  <p className="text-gray-600">{card.title}</p>
                  <p className={`text-lg font-bold ${card.color}`}>{card.value}</p>
                </div>
              );
            })}

            {/* Center Dashed Circle */}
            <div className="absolute w-[280px] h-[280px] border border-dashed border-indigo-300 rounded-full z-0"></div>
          </div>
        </div>
      </section>

      {/* Filter & Search Section */}
      <section className="py-4 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="পণ্য খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="ক্যাটেগরি নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব ক্যাটেগরি</SelectItem>
                  <SelectItem value="web">ওয়েব সাবস্ক্রিপশন ({categoryStats.web || 0})</SelectItem>
                  <SelectItem value="mobile">মোবাইল অ্যাপ ({categoryStats.mobile || 0})</SelectItem>
                  <SelectItem value="tutorial">টিউটোরিয়াল/কোর্স ({categoryStats.tutorial || 0})</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Products Section */}
      {!popularLoading && popularProducts.length > 0 && (
        <section className="py-8">
          <div className="container mx-auto px-2 sm:px-4">
            <div className="flex items-center gap-2 mb-6">
              <Star className="h-6 w-6 text-yellow-500" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">জনপ্রিয় পণ্য</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {popularProducts.map((product) => (
                <PopularProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Offer Products Section */}
      {!offerLoading && offerProducts.length > 0 && (
        <section className="py-8 bg-gradient-to-r from-orange-100 to-yellow-100">
          <div className="container mx-auto px-2 sm:px-4">
            <div className="flex items-center gap-2 mb-6">
              <Gift className="h-6 w-6 text-orange-500" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">বিশেষ অফার</h2>
              <Badge className="bg-red-500 text-white animate-pulse">সীমিত সময়</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {offerProducts.map((product) => (
                <OfferProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Regular Products Section */}
      <section className="py-8">
        <div className="container mx-auto px-2 sm:px-4">
          {selectedCategory !== 'all' && (
            <div className="mb-4">
              <h2 className="text-xl sm:text-2xl font-bold mb-2">{getCategoryLabel(selectedCategory)}</h2>
              <p className="text-gray-600">{filteredProducts.length} টি পণ্য পাওয়া গেছে</p>
            </div>
          )}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">কোন পণ্য পাওয়া যায়নি।</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
