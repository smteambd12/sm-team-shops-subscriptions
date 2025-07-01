
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { products } from '../data/products';

const Categories = () => {
  const { category } = useParams<{ category: string }>();
  
  const categoryProducts = products.filter(p => p.category === category);
  
  const getCategoryTitle = () => {
    switch (category) {
      case 'web': return 'ওয়েব সাবস্ক্রিপশন';
      case 'mobile': return 'মোবাইল অ্যাপ সাবস্ক্রিপশন';
      case 'tutorial': return 'টিউটোরিয়াল কোর্স';
      default: return 'পণ্যসমূহ';
    }
  };

  const getCategoryDescription = () => {
    switch (category) {
      case 'web': return 'Netflix, Spotify, Canva সহ জনপ্রিয় ওয়েব সার্ভিসের প্রিমিয়াম সাবস্ক্রিপশন';
      case 'mobile': return 'KineMaster, CapCut সহ মোবাইল অ্যাপের প্রো ভার্সন পান সাশ্রয়ী দামে';
      case 'tutorial': return 'দক্ষতা বৃদ্ধির জন্য বিশেষজ্ঞদের কাছ থেকে শিখুন';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="container mx-auto px-2 sm:px-4">
        {/* Header */}
        <div className="flex items-center mb-4 sm:mb-8">
          <Link to="/" className="mr-2 sm:mr-4 p-1 sm:p-2 hover:bg-gray-200 rounded-full transition-colors">
            <ArrowLeft size={20} className="sm:w-6 sm:h-6" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{getCategoryTitle()}</h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">{getCategoryDescription()}</p>
          </div>
        </div>

        {/* Category Banner */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl p-4 sm:p-8 mb-4 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4">বিশেষ অফার!</h2>
          <p className="text-purple-100 mb-3 sm:mb-4 text-sm sm:text-base">
            এই ক্যাটেগরির সব পণ্যে পাচ্ছেন ৫০% পর্যন্ত ছাড়! সীমিত সময়ের জন্য।
          </p>
          <div className="flex flex-wrap items-center gap-2 sm:space-x-4">
            <span className="bg-white/20 px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm">✨ মানসম্পন্ন সেবা</span>
            <span className="bg-white/20 px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm">🚀 তাৎক্ষণিক ডেলিভারি</span>
            <span className="bg-white/20 px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm">🛡️ ১০০% নিরাপদ</span>
          </div>
        </div>

        {/* Products Grid */}
        {categoryProducts.length > 0 ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                সব পণ্য ({categoryProducts.length}টি)
              </h3>
              <select className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm sm:text-base">
                <option>জনপ্রিয়তা অনুসারে</option>
                <option>দাম: কম থেকে বেশি</option>
                <option>দাম: বেশি থেকে কম</option>
                <option>নতুন আগে</option>
              </select>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6">
              {categoryProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <div className="text-4xl sm:text-6xl mb-4">🔍</div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">কোনো পণ্য পাওয়া যায়নি</h3>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">এই ক্যাটেগরিতে এখনো কোনো পণ্য যোগ করা হয়নি।</p>
            <Link 
              to="/"
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:shadow-lg transition-all duration-200 inline-block text-sm sm:text-base"
            >
              হোমে ফিরে যান
            </Link>
          </div>
        )}

        {/* Why Choose Us */}
        <div className="mt-8 sm:mt-16 bg-white rounded-2xl p-4 sm:p-8 shadow-lg">
          <h3 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8 text-gray-800">কেন আমাদের বেছে নেবেন?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center">
              <div className="bg-green-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-xl sm:text-2xl">✅</span>
              </div>
              <h4 className="font-bold text-base sm:text-lg mb-2">১০০% অরিজিনাল</h4>
              <p className="text-gray-600 text-sm sm:text-base">সব সাবস্ক্রিপশন সম্পূর্ণ বৈধ ও অরিজিনাল</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-xl sm:text-2xl">💰</span>
              </div>
              <h4 className="font-bold text-base sm:text-lg mb-2">সাশ্রয়ী দাম</h4>
              <p className="text-gray-600 text-sm sm:text-base">বাজারের সবচেয়ে কম দামে পাবেন</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-xl sm:text-2xl">⚡</span>
              </div>
              <h4 className="font-bold text-base sm:text-lg mb-2">তাৎক্ষণিক সেবা</h4>
              <p className="text-gray-600 text-sm sm:text-base">পেমেন্টের পরপরই অ্যাক্টিভ হবে</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
