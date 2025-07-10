import React, { useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import Image from 'next/image';

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

  const categoryStats = products.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getCategoryLabel = (category: string) => {
    const labels = {
      web: 'ওয়েব সাবস্ক্রিপশন',
      mobile: 'মোবাইল অ্যাপ',
      tutorial: 'টিউটোরিয়াল/কোর্স'
    };
    return labels[category as keyof typeof labels] || category;
  };

  const statCards = [
    { title: "সাপোর্ট টিকেট", value: "1,200+", color: "text-purple-600" },
    { title: "ডিজিটাল কোর্স", value: "60+ কোর্স", color: "text-pink-600" },
    { title: "ডেলিভারি টাইম", value: "তাৎক্ষণিক", color: "text-green-600" },
    { title: "অ্যাপ সার্ভিস", value: "30+ অ্যাপ", color: "text-yellow-600" },
    { title: "ওয়েব সাবস্ক্রিপশন", value: "100+", color: "text-blue-600" },
    { title: "ডিজাইন অর্ডার", value: "300+", color: "text-red-600" },
    { title: "টপ ক্যাটেগরি", value: "টিউটোরিয়াল, অ্যাপ", color: "text-indigo-600" },
    { title: "গ্রাহক সন্তুষ্টি", value: "95%", color: "text-teal-600" }
  ];

  if (loading) {
    return <div className="text-center py-12">লোড হচ্ছে...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-red-600">ডেটা লোডে সমস্যা হয়েছে।</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative py-10 sm:py-16 md:py-14 overflow-hidden">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 items-center gap-4">
          {/* Left Text */}
          <div className="space-y-4 text-center md:text-left">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-800 leading-tight">
              SM TEAM SHOPS - <br className="md:hidden" /> ডিজিটাল সেবা সহজ করে
            </h1>
            <p className="text-gray-700 text-base sm:text-lg">
              আমরা বিশ্বাস করি আপনার ডিজিটাল প্রয়োজনে বিশ্বাসযোগ্যতা, গতি এবং মূল্য সবকিছু একসাথে দরকার।
            </p>
            <div className="flex justify-center md:justify-start gap-3 flex-wrap pt-2">
              <Badge variant="secondary">৫০% পর্যন্ত ছাড়</Badge>
              <Badge variant="secondary">তাৎক্ষণিক ডেলিভারি</Badge>
              <Badge variant="secondary">২৪/৭ সাপোর্ট</Badge>
            </div>
          </div>

          {/* Right Image & Cards */}
          <div className="relative w-full flex justify-center items-center">
            <div className="relative w-[280px] h-[280px]">
              <Image
                src="https://1.bp.blogspot.com/-A5YAXYSGKic/YQ9Ak6QhUHI/AAAAAAAAKUk/ev0FYeUU4kklp8UgUkxKEF1LDO7FzPDEgCLcBGAsYHQ/s0/3d-businessman-using-laptop-illustration-png.png"
                alt="hero"
                layout="fill"
                objectFit="contain"
                className="z-10"
              />
              {/* Connection lines */}
              {statCards.map((card, index) => {
                const angle = (360 / statCards.length) * index;
                const x = 130 + 180 * Math.cos((angle * Math.PI) / 180);
                const y = 130 + 180 * Math.sin((angle * Math.PI) / 180);
                const lineStyle = {
                  left: '140px',
                  top: '140px',
                  transform: `rotate(${angle}deg)`,
                  transformOrigin: 'top left',
                };
                return (
                  <React.Fragment key={index}>
                    <div className="absolute w-[2px] h-[40px] bg-gray-400" style={lineStyle}></div>
                    <div
                      className="absolute bg-white rounded-lg shadow-md p-2 text-xs sm:text-sm text-center animate-fade-in"
                      style={{
                        top: y,
                        left: x,
                        width: '100px',
                        zIndex: 10,
                      }}
                    >
                      <div className="font-semibold">{card.title}</div>
                      <div className={`${card.color} font-bold`}>{card.value}</div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-8 sm:py-14">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
            <div className="relative flex-1">
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
                <SelectTrigger className="w-44">
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

          {filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">কোন পণ্য পাওয়া যায়নি।</div>
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
