import React, { useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';

// গুড টাইম মেসেজ
const getGreeting = () => {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return '☀️ Good Morning';
  if (h >= 12 && h < 17) return '🌤️ Good Afternoon';
  if (h >= 17 && h < 21) return '🌇 Good Evening';
  return '🌙 Good Night';
};

const Home = () => {
  const { products, loading, error } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="animate-pulse">
          <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/2 sm:w-1/4 mb-4 sm:mb-6"></div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 sm:h-96 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="text-center text-red-600">
          <p className="text-sm sm:text-base">পণ্য লোড করতে সমস্যা হয়েছে। পেজ রিফ্রেশ করুন।</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative bg-[#f8f9ff] pt-6 pb-10 sm:pt-12 sm:pb-16">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row justify-between items-center">
          
          {/* Left Side Text */}
          <div className="max-w-xl text-center lg:text-left mb-8 lg:mb-0 space-y-2 sm:space-y-4">
            <p className="text-lg sm:text-2xl font-bold text-indigo-600 animate-pulse">{getGreeting()}</p>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              SM TEAM <span className="hidden sm:inline">SHOPS</span> -
              <span className="block text-xl sm:text-2xl text-blue-700 font-bold mt-1 sm:mt-2 underline decoration-indigo-400 decoration-2">
                ডিজিটাল সেবা
              </span>
            </h1>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
              বিশ্বাসযোগ্যতা, গতি ও মূল্য – সব এক জায়গায়!
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-2 mt-2">
              <Badge variant="secondary">৫০% পর্যন্ত ছাড়</Badge>
              <Badge variant="secondary">তাৎক্ষণিক ডেলিভারি</Badge>
              <Badge variant="secondary">২৪/৭ সাপোর্ট</Badge>
            </div>
          </div>

          {/* Right Side Image */}
          <div className="relative w-full lg:w-1/2 flex flex-col items-center">
            <img
              src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiFaskoHaK271IdQpGdmPhPDA1TK7U69kmczdhp-BTugHt5eQPkc5MODaM0rfsIdCnMQ3LyG2zoTJiq_LLJKo6i4soD67m1L9eB4IxyhLlcJ_gBFgMFbWfjYC07WhWjaXrXsPPZLb-x_oPYs8oh6PEp1_4e34Jo_QgGF3hk8Rh4fTCRjSO_pD1_2eaXEljm/s1600/Untitled%20design%20%2830%29.png"
              alt="Hero Character"
              className="w-[200px] sm:w-[280px] md:w-[340px] z-10"
            />
          </div>
        </div>
      </section>

      {/* Product Section */}
      <section className="py-8 sm:py-16">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:gap-4 mb-6 sm:mb-8">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="পণ্য খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm sm:text-base"
                />
              </div>
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

          {selectedCategory !== 'all' && (
            <div className="mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-2">{getCategoryLabel(selectedCategory)}</h2>
              <p className="text-gray-600 text-sm sm:text-base">{filteredProducts.length} টি পণ্য পাওয়া গেছে</p>
            </div>
          )}

          {filteredProducts.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <p className="text-gray-500 text-base sm:text-lg">কোন পণ্য পাওয়া যায়নি।</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6">
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
