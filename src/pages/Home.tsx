import React, { useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
      <section className="relative overflow-hidden bg-[#f8f9ff] pt-12 pb-16">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row justify-between items-center relative z-10">
          {/* Left text */}
          <div className="max-w-xl text-left mb-8 lg:mb-0">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-snug">
              SM TEAM SHOPS - <br />
              <span className="underline decoration-4 decoration-indigo-500">ডিজিটাল সেবা সহজ করে</span>
            </h1>
            <p className="text-gray-700 text-base sm:text-lg">
              আমরা বিশ্বাস করি আপনার ডিজিটাল প্রয়োজনে বিশ্বাসযোগ্যতা, গতি এবং মূল্য সবকিছু একসাথে দরকার।
            </p>
            <div className="flex flex-wrap mt-6 gap-3">
              <Badge variant="secondary">৫০% পর্যন্ত ছাড়</Badge>
              <Badge variant="secondary">তাৎক্ষণিক ডেলিভারি</Badge>
              <Badge variant="secondary">২৪/৭ সাপোর্ট</Badge>
            </div>
          </div>

          {/* Right image with cards */}
          <div className="relative w-full lg:w-1/2 flex justify-center items-center">
            <img
              src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiFaskoHaK271IdQpGdmPhPDA1TK7U69kmczdhp-BTugHt5eQPkc5MODaM0rfsIdCnMQ3LyG2zoTJiq_LLJKo6i4soD67m1L9eB4IxyhLlcJ_gBFgMFbWfjYC07WhWjaXrXsPPZLb-x_oPYs8oh6PEp1_4e34Jo_QgGF3hk8Rh4fTCRjSO_pD1_2eaXEljm/s1600/Untitled%20design%20%2830%29.png"
              alt="Hero Character"
              className="w-[280px] sm:w-[340px] md:w-[360px] z-10"
            />

            {/* Stat Cards */}
            {statCards.map((card, index) => (
              <div
                key={index}
                className={`absolute bg-white shadow-md border rounded-lg px-3 py-2 text-sm font-medium transform transition-all duration-500 hover:scale-105 animate-fade-in-up z-20
                ${index === 0 ? 'top-0 left-8' :
                  index === 1 ? 'top-8 right-0' :
                  index === 2 ? 'top-28 left-0' :
                  index === 3 ? 'bottom-28 right-2' :
                  index === 4 ? 'bottom-8 left-20' :
                  index === 5 ? 'bottom-0 right-12' : ''}`}
              >
                <p className="text-gray-600">{card.title}</p>
                <p className={`text-lg font-bold ${card.color}`}>{card.value}</p>
              </div>
            ))}

            {/* Center Line */}
            <div className="absolute w-[300px] h-[300px] border border-dashed border-indigo-300 rounded-full z-0"></div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-8 sm:py-16">
        <div className="container mx-auto px-2 sm:px-4">
          {/* Filter/Search */}
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

          {/* Filtered Products */}
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
