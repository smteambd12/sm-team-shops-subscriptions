import React, { useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import Typewriter from 'typewriter-effect';

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
      
      {/* ✅ Hero Section with Video + Image */}
      <section className="bg-gradient-to-r from-indigo-700 via-purple-600 to-pink-600 text-white py-12 px-4 relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-pink-500 opacity-30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-indigo-500 opacity-30 rounded-full blur-3xl animate-pulse" />

        <div className="container mx-auto relative z-10 flex flex-col-reverse md:flex-row items-center justify-between gap-10">
          {/* Left side - Text */}
          <div className="text-center md:text-left max-w-xl">
            <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 leading-tight">
              <Typewriter
                options={{
                  strings: ['প্রিমিয়াম সাবস্ক্রিপশন', 'সেরা অফার এখনই', 'ভিডিও বিজ্ঞাপনসহ!'],
                  autoStart: true,
                  loop: true,
                  delay: 60,
                  deleteSpeed: 30,
                }}
              />
            </h1>
            <p className="text-lg sm:text-xl mb-6 opacity-90">
              এখন ভিডিও এবং ছবি সহ বিজ্ঞাপন দিন আপনার সেবার প্রচারে!
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <Badge className="bg-white text-indigo-700 font-semibold px-4 py-2 rounded-full shadow hover:bg-gray-100 transition">
                🎥 ভিডিও প্রিভিউ
              </Badge>
              <Badge className="bg-white text-indigo-700 font-semibold px-4 py-2 rounded-full shadow hover:bg-gray-100 transition">
                🖼️ ইমেজ বিজ্ঞাপন
              </Badge>
            </div>
          </div>

          {/* Right side - Media */}
          <div className="w-full md:w-1/2 flex flex-col items-center gap-6">
            {/* Video */}
            <div className="w-full aspect-video rounded-lg overflow-hidden shadow-lg border-4 border-white">
              <video controls autoPlay loop muted className="w-full h-full object-cover">
                <source src="/ads/sample-video.mp4" type="video/mp4" />
                আপনার ব্রাউজার ভিডিও সাপোর্ট করে না।
              </video>
            </div>

            {/* Image */}
            <img
              src="/ads/sample-banner.jpg"
              alt="বিজ্ঞাপন ব্যানার"
              className="w-full rounded-lg shadow-lg border-4 border-white"
            />
          </div>
        </div>
      </section>

      {/* ✅ Products Section */}
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

          {selectedCategory !== 'all' && (
            <div className="mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-2">
                {getCategoryLabel(selectedCategory)}
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                {filteredProducts.length} টি পণ্য পাওয়া গেছে
              </p>
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
