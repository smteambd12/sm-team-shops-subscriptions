import React, { useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';

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
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
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
      <div className="container mx-auto px-4 py-8 text-center text-red-600">
        <p>পণ্য লোড করতে সমস্যা হয়েছে। পেজ রিফ্রেশ করুন।</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#f8f9ff] py-6 sm:py-12">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-10">
          {/* Left Text */}
          <div className="max-w-xl w-full text-center lg:text-left space-y-4">
            <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-snug">
              <span className="block text-indigo-600 drop-shadow-lg animate-pulse">
                {greeting}
              </span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-pink-500 to-purple-600">
                SM TEAM SHOPS -
              </span>
              <span className="block text-base sm:text-xl text-blue-700 font-bold underline decoration-indigo-400">
                ডিজিটাল সেবা সহজ করে
              </span>
            </h1>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
              আমরা বিশ্বাস করি আপনার ডিজিটাল প্রয়োজনে <span className="font-semibold text-indigo-600">বিশ্বাসযোগ্যতা</span>, <span className="font-semibold text-pink-600">গতি</span> এবং <span className="font-semibold text-green-600">মূল্য</span> – সবকিছু একসাথে দরকার।
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-2">
              <Badge variant="secondary">৫০% পর্যন্ত ছাড়</Badge>
              <Badge variant="secondary">তাৎক্ষণিক ডেলিভারি</Badge>
              <Badge variant="secondary">২৪/৭ সাপোর্ট</Badge>
            </div>
          </div>

          {/* Right Image & Stats */}
          <div className="relative w-full max-w-sm mx-auto flex flex-col items-center">
            <img
              src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiFaskoHaK271IdQpGdmPhPDA1TK7U69kmczdhp-BTugHt5eQPkc5MODaM0rfsIdCnMQ3LyG2zoTJiq_LLJKo6i4soD67m1L9eB4IxyhLlcJ_gBFgMFbWfjYC07WhWjaXrXsPPZLb-x_oPYs8oh6PEp1_4e34Jo_QgGF3hk8Rh4fTCRjSO_pD1_2eaXEljm/s1600/Untitled%20design%20%2830%29.png"
              alt="Hero Character"
              className="w-[220px] sm:w-[300px] md:w-[320px] z-10"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 z-20">
              {statCards.map((card, index) => (
                <div
                  key={index}
                  className="bg-white shadow-sm border rounded-lg px-3 py-2 text-center text-sm font-medium"
                >
                  <p className="text-gray-600">{card.title}</p>
                  <p className={`text-lg font-bold ${card.color}`}>{card.value}</p>
                </div>
              ))}
            </div>
            <div className="absolute w-[250px] h-[250px] border border-dashed border-indigo-300 rounded-full -z-10"></div>
          </div>
        </div>
      </section>

      {/* Product Section */}
      <section className="py-8 sm:py-14">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
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

          {/* Filtered Result Title */}
          {selectedCategory !== 'all' && (
            <div className="mb-4">
              <h2 className="text-xl sm:text-2xl font-bold mb-2">{getCategoryLabel(selectedCategory)}</h2>
              <p className="text-gray-600">{filteredProducts.length} টি পণ্য পাওয়া গেছে</p>
            </div>
          )}

          {/* Product Cards */}
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
