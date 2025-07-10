import React, { useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';

const Home = () => {
  const { products, loading, error } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      web: 'ওয়েব সাবস্ক্রিপশন',
      mobile: 'মোবাইল অ্যাপ',
      tutorial: 'টিউটোরিয়াল/কোর্স'
    };
    return labels[category] || category;
  };

  const categoryStats: Record<string, number> = products.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-300 rounded w-1/2"></div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
        পণ্য লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে পেজ রিফ্রেশ করুন।
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">

      {/* ✅ Hero Section */}
      <section className="relative bg-gradient-to-r from-purple-100 to-blue-100 py-12 sm:py-16 text-gray-900 overflow-hidden">
        <div className="container mx-auto px-4 flex flex-col-reverse md:flex-row items-center justify-between relative z-10">
          <div className="text-center md:text-left max-w-xl">
            <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-4">
              SM TEAM SHOPS - ডিজিটাল সেবা সহজ করে
            </h1>
            <p className="text-base sm:text-lg opacity-80 mb-6">
              আমরা বিশ্বাস করি আপনার ডিজিটাল প্রয়োজন মেটাতে বিশ্বস্ততা, গতি এবং মূল্য সাশ্রয় একসাথে দরকার।
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              <Badge variant="secondary" className="text-sm px-4 py-2">৫০% পর্যন্ত ছাড়</Badge>
              <Badge variant="secondary" className="text-sm px-4 py-2">তাৎক্ষণিক ডেলিভারি</Badge>
              <Badge variant="secondary" className="text-sm px-4 py-2">২৪/৭ সাপোর্ট</Badge>
            </div>
          </div>

          {/* ✅ 3D Image */}
          <div className="relative w-[280px] sm:w-[350px] md:w-[400px] mb-8 md:mb-0">
            <img
              src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiFaskoHaK271IdQpGdmPhPDA1TK7U69kmczdhp-BTugHt5eQPkc5MODaM0rfsIdCnMQ3LyG2zoTJiq_LLJKo6i4soD67m1L9eB4IxyhLlcJ_gBFgMFbWfjYC07WhWjaXrXsPPZLb-x_oPYs8oh6PEp1_4e34Jo_QgGF3hk8Rh4fTCRjSO_pD1_2eaXEljm/s1600/Untitled%20design%20%2830%29.png"
              alt="Hero Character"
              className="w-full h-auto object-contain relative z-10"
            />
            {/* Floating Cards */}
            <div className="absolute top-0 left-0 bg-white/90 p-3 rounded-lg shadow-lg w-32">
              <p className="text-sm font-medium">Customer Success</p>
              <p className="text-xl font-bold text-green-600">+8.5%</p>
            </div>
            <div className="absolute top-10 right-0 bg-white/90 p-3 rounded-lg shadow-lg w-28">
              <p className="text-sm font-medium">Growth</p>
              <p className="text-base font-bold text-blue-600">+23%</p>
            </div>
            <div className="absolute bottom-4 right-4 bg-white/90 p-3 rounded-lg shadow-lg w-36">
              <p className="text-xs text-gray-600">Top Categories</p>
              <div className="flex gap-1 items-end h-10 mt-1">
                <div className="w-2 bg-purple-400 rounded-t h-3/6"></div>
                <div className="w-2 bg-pink-400 rounded-t h-5/6"></div>
                <div className="w-2 bg-yellow-400 rounded-t h-2/6"></div>
                <div className="w-2 bg-blue-400 rounded-t h-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Background Blur Decorations */}
        <div className="absolute -top-10 -left-10 w-72 h-72 bg-pink-300 rounded-full filter blur-3xl opacity-30 z-0" />
        <div className="absolute bottom-0 -right-10 w-72 h-72 bg-purple-400 rounded-full filter blur-3xl opacity-30 z-0" />
      </section>

      {/* ✅ Products Section */}
      <section className="py-8 sm:py-16">
        <div className="container mx-auto px-4">
          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="পণ্য খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm sm:text-base"
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
                  <SelectItem value="web">
                    ওয়েব সাবস্ক্রিপশন ({categoryStats.web || 0})
                  </SelectItem>
                  <SelectItem value="mobile">
                    মোবাইল অ্যাপ ({categoryStats.mobile || 0})
                  </SelectItem>
                  <SelectItem value="tutorial">
                    টিউটোরিয়াল/কোর্স ({categoryStats.tutorial || 0})
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filter Info */}
          {selectedCategory !== 'all' && (
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-1">
                {getCategoryLabel(selectedCategory)}
              </h2>
              <p className="text-gray-600 text-sm">{filteredProducts.length} টি পণ্য পাওয়া গেছে</p>
            </div>
          )}

          {/* Product List */}
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
