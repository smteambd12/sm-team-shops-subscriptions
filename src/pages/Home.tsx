import React, { useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';

const features = [
  { title: 'সাপোর্ট টিকেট', value: '1,200+', color: 'text-purple-600' },
  { title: 'ডেলিভারি টাইম', value: 'তাৎক্ষণিক', color: 'text-green-500' },
  { title: 'কাস্টমার ট্রাস্ট', value: '95%', color: 'text-blue-500' },
  { title: 'টিউটোরিয়াল', value: '৫০+ কোর্স', color: 'text-pink-500' },
  { title: 'অ্যাপ সেবা', value: '৩০+ অ্যাপ', color: 'text-yellow-500' },
  { title: 'ওয়েব সার্ভিস', value: '১০০+', color: 'text-indigo-500' },
  { title: 'ডেইলি অর্ডার', value: '২০০+', color: 'text-red-500' },
];

const Home = () => {
  const { products, loading, error } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryLabel = (category: string) => {
    const labels = {
      web: 'ওয়েব সাবস্ক্রিপশন',
      mobile: 'মোবাইল অ্যাপ',
      tutorial: 'টিউটোরিয়াল/কোর্স',
    };
    return labels[category as keyof typeof labels] || category;
  };

  const categoryStats = products.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">

      {/* ✅ Hero Section */}
      <section className="relative py-10 sm:py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left Text */}
          <div className="flex-1 space-y-4 text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              SM TEAM SHOPS - <br className="hidden sm:inline" />
              ডিজিটাল সেবা সহজ করে
            </h1>
            <p className="text-sm sm:text-base text-gray-700">
              আমরা বিশ্বাস করি আপনার ডিজিটাল প্রয়োজনে বিশ্বাসযোগ্যতা, গতি এবং মূল্য সাশ্রয় একসাথে দরকার।
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              <Badge variant="secondary">৫০% পর্যন্ত ছাড়</Badge>
              <Badge variant="secondary">তাৎক্ষণিক ডেলিভারি</Badge>
              <Badge variant="secondary">২৪/৭ সাপোর্ট</Badge>
            </div>
          </div>

          {/* Right Side - Image + Cards */}
          <div className="flex-1 relative flex justify-center items-center mt-8 md:mt-0">
            <img
              src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiFaskoHaK271IdQpGdmPhPDA1TK7U69kmczdhp-BTugHt5eQPkc5MODaM0rfsIdCnMQ3LyG2zoTJiq_LLJKo6i4soD67m1L9eB4IxyhLlcJ_gBFgMFbWfjYC07WhWjaXrXsPPZLb-x_oPYs8oh6PEp1_4e34Jo_QgGF3hk8Rh4fTCRjSO_pD1_2eaXEljm/s1600/Untitled%20design%20%2830%29.png"
              alt="Hero Character"
              className="w-64 sm:w-72 md:w-80 z-10 relative"
            />

            {/* Cards around image */}
            <div className="absolute inset-0 flex flex-wrap justify-center items-center gap-2 sm:gap-4 animate-fade-in">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`bg-white shadow-md rounded-lg px-3 py-2 text-center text-xs sm:text-sm w-28 sm:w-32 transition-all duration-500 transform hover:scale-105 border ${
                    feature.color
                  }`}
                  style={{
                    position: 'absolute',
                    top: `${30 + (index % 3) * 50}px`,
                    left: `${index * 30}px`,
                  }}
                >
                  <p className="font-medium text-gray-500">{feature.title}</p>
                  <p className={`font-bold ${feature.color}`}>{feature.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ✅ Product Search & Filter */}
      <section className="py-10 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
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

          {selectedCategory !== 'all' && (
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-1">{getCategoryLabel(selectedCategory)}</h2>
              <p className="text-gray-600 text-sm">{filteredProducts.length} টি পণ্য পাওয়া গেছে</p>
            </div>
          )}

          {filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-base">কোন পণ্য পাওয়া যায়নি।</p>
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
