import React, { useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { Card, CardContent } from '@/components/ui/card';

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
      tutorial: 'টিউটোরিয়াল/কোর্স'
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
      <section className="relative py-10 sm:py-14 overflow-hidden">
        <div className="container mx-auto px-4 flex flex-col-reverse md:flex-row items-center justify-between">
          {/* Left Content */}
          <div className="text-center md:text-left max-w-xl space-y-4">
            <h1 className="text-3xl sm:text-5xl font-bold text-gray-900">
              SM TEAM SHOPS - ডিজিটাল সেবা সহজ করে
            </h1>
            <p className="text-base sm:text-lg text-gray-600">
              আমরা বিশ্বাস করি আপনার ডিজিটাল প্রয়োজনে বিশ্বাসযোগ্যতা, গতি এবং মূল্য সাশ্রয় একসাথে দরকার।
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              <Badge className="text-sm px-3 py-1 bg-white border shadow-sm">৫০% পর্যন্ত ছাড়</Badge>
              <Badge className="text-sm px-3 py-1 bg-white border shadow-sm">তাৎক্ষণিক ডেলিভারি</Badge>
              <Badge className="text-sm px-3 py-1 bg-white border shadow-sm">২৪/৭ সাপোর্ট</Badge>
            </div>
          </div>

          {/* Right: Image with floating cards */}
          <div className="relative w-[280px] sm:w-[360px] md:w-[400px]">
            <img
              src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiFaskoHaK271IdQpGdmPhPDA1TK7U69kmczdhp-BTugHt5eQPkc5MODaM0rfsIdCnMQ3LyG2zoTJiq_LLJKo6i4soD67m1L9eB4IxyhLlcJ_gBFgMFbWfjYC07WhWjaXrXsPPZLb-x_oPYs8oh6PEp1_4e34Jo_QgGF3hk8Rh4fTCRjSO_pD1_2eaXEljm/s1600/Untitled%20design%20%2830%29.png"
              alt="Hero Character"
              className="w-full h-auto z-10 relative"
            />

            {/* Floating Cards */}
            <Card className="absolute top-0 -left-20 w-40 shadow-md animate-fade-in-up">
              <CardContent className="p-3">
                <p className="text-xs text-gray-600">Customer Success</p>
                <p className="text-lg font-bold text-green-600">+8.5%</p>
              </CardContent>
            </Card>

            <Card className="absolute top-6 right-0 w-36 shadow-md animate-fade-in-up delay-100">
              <CardContent className="p-3">
                <p className="text-xs text-gray-600">Growth</p>
                <p className="text-base font-semibold text-blue-600">+23%</p>
              </CardContent>
            </Card>

            <Card className="absolute -bottom-4 left-8 w-44 shadow-md animate-fade-in-up delay-200">
              <CardContent className="p-3">
                <p className="text-xs text-gray-600 mb-1">Top Categories</p>
                <div className="flex gap-1 items-end h-10">
                  <div className="w-3 bg-purple-400 rounded-t" style={{ height: '40%' }} />
                  <div className="w-3 bg-indigo-500 rounded-t" style={{ height: '80%' }} />
                  <div className="w-3 bg-pink-400 rounded-t" style={{ height: '60%' }} />
                  <div className="w-3 bg-blue-400 rounded-t" style={{ height: '100%' }} />
                </div>
              </CardContent>
            </Card>

            {/* Right side extra card */}
            <Card className="absolute top-1/2 right-[-80px] w-44 shadow-md animate-fade-in-up delay-300">
              <CardContent className="p-3">
                <p className="text-xs text-gray-600">Support Tickets</p>
                <p className="text-base font-bold text-purple-600">1,200+</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Background Decorations */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-pink-300 rounded-full blur-3xl opacity-20 z-0" />
        <div className="absolute bottom-0 -right-20 w-64 h-64 bg-blue-300 rounded-full blur-3xl opacity-20 z-0" />
      </section>

      {/* ✅ Product Section */}
      <section className="py-10 sm:py-16">
        <div className="container mx-auto px-4">
          {/* Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div className="relative w-full sm:w-1/2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="পণ্য খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm sm:text-base"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="ক্যাটেগরি নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব ক্যাটেগরি</SelectItem>
                  <SelectItem value="web">ওয়েব ({categoryStats.web || 0})</SelectItem>
                  <SelectItem value="mobile">মোবাইল ({categoryStats.mobile || 0})</SelectItem>
                  <SelectItem value="tutorial">কোর্স ({categoryStats.tutorial || 0})</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <p className="text-center text-gray-500 py-10">কোন পণ্য পাওয়া যায়নি।</p>
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
