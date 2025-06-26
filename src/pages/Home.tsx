
import React, { useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';

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
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-96 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <p>পণ্য লোড করতে সমস্যা হয়েছে। পেজ রিফ্রেশ করুন।</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            প্রিমিয়াম সাবস্ক্রিপশন
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            সবচেয়ে কম দামে পেয়ে যান আপনার পছন্দের সব সেবা
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              ৫০% পর্যন্ত ছাড়
            </Badge>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              তাৎক্ষণিক ডেলিভারি
            </Badge>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              ২৪/৭ সাপোর্ট
            </Badge>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="পণ্য খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
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
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">
                {getCategoryLabel(selectedCategory)}
              </h2>
              <p className="text-gray-600">
                {filteredProducts.length} টি পণ্য পাওয়া গেছে
              </p>
            </div>
          )}

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">কোন পণ্য পাওয়া যায়নি।</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
